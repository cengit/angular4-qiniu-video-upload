import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {HttpClient, HttpEventType, HttpHeaders, HttpRequest, HttpResponse} from '@angular/common/http';
import 'rxjs/add/operator/retry';
import {unescape} from 'querystring';

interface UptokenResponse {
    uptoken: string ;
}

interface MkBlkRet {
    ctx: string;
    checksum: string;
    crc32: string;
    offset: string;
    host: string;
}

@Component({
  selector: 'app-upload4',
  templateUrl: './upload4.component.html',
  styleUrls: ['./upload4.component.css']
})


export class Upload4Component implements OnInit {
    uptoken: string;
    loading: boolean;
    blockSize: number = 4 * 1024 * 1024;
    progress: string;
    percentDone = 0;
    upHost = 'http://upload.qiniu.com';
    @Input() multiple = true;

    constructor(private http: HttpClient, private el: ElementRef) {
    }

    ngOnInit(): void {
        this.http.get<UptokenResponse>('http://localhost:8083/uptoken').subscribe(
            data => {
                this.uptoken = data.uptoken;
            },
            err => {
                this.uptoken = "vDKKlyoR8J4PiehfSaK2eNQv_bxlYf8PxqwlE-Qe:iTqBiFec942IOEeWNSx_qVy2Btg=:eyJyZXR1cm5Cb2R5Ijoie1wiaGFzaFwiOiQoZXRhZyksXCJrZXlcIjokKGtleSksXCJwZXJzaXN0ZW50SWRcIjokKHBlcnNpc3RlbnRJZCksXCJhdmluZm9fZHVyYXRpb25cIjokKGF2aW5mby52aWRlby5kdXJhdGlvbil9Iiwic2F2ZUtleSI6IiQoeWVhcilcLyQobW9uKVwvJChkYXkpXC8kKGV0YWcpJChleHQpIiwibWltZUxpbWl0IjoidmlkZW9cLyoiLCJwZXJzaXN0ZW50T3BzIjoiYXZ0aHVtYlwvbXA0XC92Y29kZWNcL2xpYngyNjRcL3NcLzY0MHg2NDBcL2F1dG9zY2FsZVwvMXxzYXZlYXNcL2MyVmxMWFpwWkdWdk9qSXdNVGd2TURjdk16QXZNVFF2TXpReU56VTVZemRtWkRsbVptWmxNalUzWkdGaVpEZGxNRFpqTkRkbU1tSXViWEEwIiwic2NvcGUiOiJzZWUtdmlkZW8iLCJkZWFkbGluZSI6MTUzMjkzNjc4NH0=";
            });
    }

    formUpload(): void {
        const inputEl = this.el.nativeElement.firstElementChild;
        if (inputEl.files.length === 0) {
            return;
        };

        const files: FileList = inputEl.files;


        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('file', files[i]);
            formData.append('key', files[i].name);
            formData.append('token', this.uptoken);
            this.loading = true;
            const request = new HttpRequest(
                'POST', this.upHost , formData,
                {reportProgress: true});
            this.http.request(request)
                .retry(3)
                .subscribe(
                    event => {
                        if (event.type === HttpEventType.UploadProgress) {
                            this.loading = true;
                            this.percentDone = Math.round(100 * event.loaded / event.total);
                            this.progress = `File is ${this.percentDone}% uploaded.`;
                        } else if (event instanceof HttpResponse) {
                            this.progress = `${event.body['key']} is uploaded`;
        }});
            this.loading = false;
        }
    }
    blockUpload(): void {
        const inputEl = this.el.nativeElement.firstElementChild;
        if (inputEl.files.length === 0) {
            return;
        };
        const files: FileList = inputEl.files;
        for (let i = 0 ; i < files.length ; i++) {
            this.makeBlock(files[i], files[i].name);
        }
    }
    makeBlock(file: File, key: string): void {
        const fileSize: number = file.size;
        const list: string[] = [];
        const blockCount = Math.ceil(fileSize / this.blockSize);
        for ( let i = 0; i < blockCount; i ++) {
            const start: number = i * this.blockSize;
            const end: number = start + this.blockSize;
            this.http.post<MkBlkRet>(this.upHost + '/mkblk/' + file.slice(start, end).size , file.slice(start, end),
            {headers: new HttpHeaders().set('Authorization', 'UpToken ' + this.uptoken),
            }).subscribe(
                data => {
                    list[i] = data.ctx;
                    let m: Boolean = true;
                    for (let n = 0; n < list.length; n++) {
                        if ((list[n] == null)) {
                            m = false;
                        }
                    }
                    this.progress = `Block ${i} is uploaded`
                    console.log(`列表完整${m}, 分块数量${blockCount}, 列表长度${list.length}, 是否合并${m && (list.length === blockCount)}`);
                    if (m && (list.length === blockCount)) {
                        this.makeFile(list.toString(), fileSize, key);
                    }
                },
                err => {
                    console.log(err);
                }
            );
        }
    }
    makeFile(list: string, fileSize: number, key: string): void {
        this.http.post(this.upHost + '/mkfile/' + fileSize + '/key/' + btoa(key), list.toString(),
            {headers: new HttpHeaders().set('Authorization', 'UpToken ' + this.uptoken),
            }).subscribe(
            data => {
                this.progress = `${data['key']} is uploaded`;
            },
            err => {
                console.log(err);
            }
        );
    }
}

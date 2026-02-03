import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { getDownloadURL, ref, Storage, uploadBytes, uploadString } from '@angular/fire/storage';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = environment.backendUrl;
  private _userDetails = new BehaviorSubject<any>(null);
  
  constructor(private fs: Firestore, private http: HttpClient,
    private storage: Storage
  ) {}

  get userInfo() {
    return this._userDetails.asObservable();
  }

  async changeProfilePic(uid: string): Promise<string> {
    try {
      if(Capacitor.getPlatform() != "web") await Camera.requestPermissions();
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt
      });
      // return image;
      if (!image?.base64String) return "";
      const base64Data = `data:image/jpeg;base64,${image.base64String}`;
      
      // const fileRef = ref(this.storage, `profile/${uid}.jpg`);
      // const blob = await this.readToBlob(image.webPath);
      // await uploadString(fileRef, image.base64String, 'base64', {
      //   contentType: 'image/jpeg'
      // });
  
      // const downloadUrl = await getDownloadURL(fileRef);
      return base64Data;
    } catch(ex) {
      console.error("Camera error", ex);
      return "";
    }
  }

  async readToBlob(webPath: any): Promise<Blob> {
    return  await fetch(webPath).then(res => res.blob());
  }

  updateUserInfo(uid: string, profileSettings: any) {
    return this.http.put(`${this.baseUrl}/user/info/${uid}`, profileSettings)
    .pipe(map(res => {
      this._userDetails.next(res);
      return res;
    }));
  }
  fetchUserInfo(uid: string) {
    this.http.get(`${this.baseUrl}/user/info/${uid}`)
    .subscribe({
      next:(res) => {
        this._userDetails.next(res);
      }
    });
  }
}

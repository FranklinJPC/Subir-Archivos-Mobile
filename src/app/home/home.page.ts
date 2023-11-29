import { Component } from '@angular/core';
import { Observable } from 'rxjs'
import { finalize, tap } from 'rxjs/operators' 
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore'

// Configuracion de los archivos a subir 
export interface imgFile {
  name: string;
  filepath: string;
  size: number;
}
export interface pdfFile {
  name: string;
  filepath: string;
  size: number;
}
export interface txtFile {
  name: string;
  filepath: string;
  size: number;
}
 
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  // Objeto de tipo tarea para subir archivos
  fileUploadsTask: AngularFireUploadTask;
  // Barra de progreso
  percentageVal: Observable<any>;
  trackSnapshot: Observable<any>;

  // --------- Imagenes ------------
  // Url para subir el archivo
  UploadedImageURL: Observable<any>;
  // Arcivvvo para subir tipo de imagen
  files: Observable<imgFile[]>;
  // Especificaciones de la imagen
  imgName: string;
  imgSize: number;

  // -------- Texto ---------------
  // Texto a subir
  textToUpload: string;
  // Url para subir el archivo
  UploadedTextURL: Observable<any>;
  // Archivo para subir tipo de texto
  text: Observable<txtFile[]>;
  // Especificaciones del texto
  textName: string;
  textSize: number;

  // -------- PDF -----------------
  // Url para subir el archivo
  UploadedPDFURL: Observable<any>;
  // Archivo para subir tipo de texto
  pdf: Observable<pdfFile[]>;
  // Especificaciones del texto
  pdfName: string;
  pdfSize: number;


  // Estado del proceso
  isFileUploading: boolean;
  isFileUploaded: boolean;
  // Arreglo de elementos para las imagenes
  private filesCollection: AngularFirestoreCollection<imgFile>;
  downloadURL: any;
  constructor(private afStorage: AngularFireStorage, private afs : AngularFirestore) {
    this.isFileUploading = false;
    this.isFileUploaded = false;
    // Definicion de la coleccion
    this.filesCollection = afs.collection<imgFile>('imagesCollection');
    // Obtener los datos de la coleccion
    this.files = this.filesCollection.valueChanges();
  }
  uploadImage(event: FileList) {
    const file: any = event.item(0)
    // Validacion de la imagen
    if (file.type.split('/')[0] !== 'image') { 
      console.log('Tipo de Archivo no permitido master >:( ')
      return;
    }
    this.isFileUploading = true;
    this.isFileUploaded = false;
    this.imgName = file.name;
    // Ruta de la imagen a subir
    const fileStoragePath = `filesStorage/${new Date().getTime()}_${file.name}`;
    // Subir la imagen
    const imageRef = this.afStorage.ref(fileStoragePath);
    this.fileUploadsTask = this.afStorage.upload(fileStoragePath, file);
    // Obtener el porcentaje de la barra de progreso
    this.percentageVal = this.fileUploadsTask.percentageChanges();
    this.trackSnapshot = this.fileUploadsTask.snapshotChanges().pipe(
      finalize(() => {
        // Obtener la url de la imagen
        this.UploadedImageURL = imageRef.getDownloadURL();
        this.UploadedImageURL.subscribe((resp) =>{
          this.storeFilesFirebase({
            name: file.name,
            filepath: resp,
            size: this.imgSize
          });
          this.isFileUploading = false;
          this.isFileUploaded = true;
        },error=>{
          console.error(error);
        })
      }),
        tap((snap:any) => {
          this.imgSize = snap.totalBytes;
        })
    )
  }
  uploadTextFile(event: FileList) {
    const file: any = event.item(0)
    // Validación del archivo de texto
    if (file.type !== 'text/plain') { 
      console.log('Tipo de Archivo no permitido master >:( ')
      return;
    }
    this.isFileUploading = true;
    this.isFileUploaded = false;
    this.pdfName = file.name;
    // Ruta del archivo de texto a subir
    const fileStoragePath = `filesStorage/${new Date().getTime()}_${file.name}`;
    // Subir el archivo de texto
    const textFileRef = this.afStorage.ref(fileStoragePath);
    this.fileUploadsTask = this.afStorage.upload(fileStoragePath, file);
    // Obtener el porcentaje de la barra de progreso
    this.percentageVal = this.fileUploadsTask.percentageChanges();
    this.trackSnapshot = this.fileUploadsTask.snapshotChanges().pipe(
      finalize(() => {
        // Obtener la URL de descarga del archivo de texto
        textFileRef.getDownloadURL().subscribe((downloadURL) => {
          this.downloadURL = downloadURL;
          this.isFileUploading = false;
          this.isFileUploaded = true;
        });
      })
    );
  }
  uploadPdfFile(event: FileList) {
    const file: any = event.item(0)
    // Validación del archivo PDF
    if (file.type !== 'application/pdf') { 
      console.log('Tipo de Archivo no permitido master >:( ')
      return;
    }
    this.isFileUploading = true;
    this.isFileUploaded = false;
    this.pdfName = file.name;
    // Ruta del archivo PDF a subir
    const fileStoragePath = `filesStorage/${new Date().getTime()}_${file.name}`;
    // Subir el archivo PDF
    const pdfFileRef = this.afStorage.ref(fileStoragePath);
    this.fileUploadsTask = this.afStorage.upload(fileStoragePath, file);
    // Obtener el porcentaje de la barra de progreso
    this.percentageVal = this.fileUploadsTask.percentageChanges();
    this.trackSnapshot = this.fileUploadsTask.snapshotChanges().pipe(
      finalize(() => {
        // Obtener la URL de descarga del archivo PDF
        pdfFileRef.getDownloadURL().subscribe((downloadURL) => {
          this.downloadURL = downloadURL;
          this.isFileUploading = false;
          this.isFileUploaded = true;
        });
      })
    );
  }
  storeFilesFirebase(image: imgFile) {
    const fileId = this.afs.createId();
    this.filesCollection.doc(fileId).set(image).then((res) => {
      console.log(res);
    }).catch(error => {
      console.log("error " + error);
    });
  }
}

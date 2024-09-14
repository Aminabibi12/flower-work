// use actix_web::{web, App, HttpServer, Responder, HttpResponse};
// use serde::{Serialize, Deserialize};
// use sqlx::postgres::PgPool;
// use sqlx::FromRow;
// use chrono::NaiveDateTime;

// #[derive(Debug, Serialize, Deserialize, FromRow)]
// struct FileMetaData {
//     id: i32,
//     name: String,
//     created_at: NaiveDateTime,
// }

// async fn get_files(pool: web::Data<PgPool>) -> impl Responder {
//     let query = "SELECT id, name, created_at FROM files";
//     let files = sqlx::query_as::<_, FileMetaData>(query)
//         .fetch_all(pool.get_ref())
//         .await
//         .unwrap();
    
//     HttpResponse::Ok().json(files)
// }

// async fn delete_file(path: web::Path<i32>, pool: web::Data<PgPool>) -> impl Responder {
//     let id = path.into_inner();
//     let query = "DELETE FROM files WHERE id = $1";
//     let result = sqlx::query(query)
//         .bind(id)
//         .execute(pool.get_ref())
//         .await;
    
//     match result {
//         Ok(_) => HttpResponse::Ok().finish(),
//         Err(_) => HttpResponse::InternalServerError().finish(),
//     }
// }

// #[actix_web::main]
// async fn main() -> std::io::Result<()> {
//     dotenv::dotenv().ok();
//     let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
//     let pool = PgPool::connect(&database_url).await.expect("Failed to connect to database");

//     HttpServer::new(move || {
//         App::new()
//             .app_data(web::Data::new(pool.clone()))
//             .route("/files", web::get().to(get_files))
//             .route("/files/{id}", web::delete().to(delete_file))
//     })
//     .bind("127.0.0.1:8080")?
//     .run()
//     .await
// }



use actix_files::NamedFile;
use actix_multipart::Multipart;
use actix_web::{web, App, HttpResponse, HttpRequest, HttpServer, Result};
use futures_util::stream::StreamExt;
use sqlx::PgPool;
use tokio::io::AsyncWriteExt;
use uuid::Uuid;
use std::path::PathBuf;

// Handler to upload a file
async fn upload_file(
    mut payload: Multipart,
    pool: web::Data<PgPool>, // Keeping it for potential database use
) -> Result<HttpResponse> {
    while let Some(field) = payload.next().await {
        let mut field = field?;
        
        // Extract the filename from the content disposition
        let filename = if let Some(fname) = field.content_disposition().get_filename() {
            fname.to_string()
        } else {
            "file".into()
        };

        let file_id = Uuid::new_v4().to_string();
        let filepath = format!("./uploads/{}", file_id);

        // Create and write the file
        let mut file = tokio::fs::File::create(&filepath).await.unwrap();
        while let Some(chunk) = field.next().await {
            let data = chunk?;
            file.write_all(&data).await.unwrap();
        }

        // Optionally, you could save file info in the database here using `pool`.
    }

    Ok(HttpResponse::Ok().finish())
}

// Handler to download a file
async fn download_file(path: web::Path<String>, _req: HttpRequest) -> Result<NamedFile> {
    let id = path.into_inner();
    let filepath: PathBuf = format!("./uploads/{}", id).into();

    // Return the file directly as NamedFile
    let file = NamedFile::open(filepath)?;
    Ok(file)
}

// Handler to delete a file
async fn delete_file(path: web::Path<String>, pool: web::Data<PgPool>) -> HttpResponse {
    let id = path.into_inner(); 
    let filepath = format!("./uploads/{}", id);

    if let Err(e) = tokio::fs::remove_file(filepath).await {
        println!("Failed to delete file: {}", e);
        return HttpResponse::InternalServerError().finish();
    }

    // Optionally, remove file info from the database here using `pool`.
    HttpResponse::Ok().finish()
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let pool = PgPool::connect("postgres://postgres:occlaptop1@localhost:5433/flowerWork").await.unwrap();
    let pool_data = web::Data::new(pool);

    // Start the Actix-web server
    HttpServer::new(move || {
        App::new()
            .app_data(pool_data.clone())
            .service(web::resource("/api/files").route(web::post().to(upload_file)))
            .service(
                web::resource("/api/files/{id}")
                    .route(web::get().to(download_file))
                    .route(web::delete().to(delete_file)),
            )
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}

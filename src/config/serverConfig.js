import dotenv from "dotenv"

dotenv.config()

export const DB_URL = process.env.DB_URL

export const PORT = process.env.PORT

export const JWT_SECRET = process.env.JWT_SECRET

export const JWT_EXPIRY = process.env.JWT_EXPIRY

export const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY

export const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME

export const S3_REGION = process.env.S3_REGION


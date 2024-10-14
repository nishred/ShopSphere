
import aws from "aws-sdk"
import { S3_ACCESS_KEY, S3_REGION, S3_SECRET_ACCESS_KEY } from "./serverConfig"

const s3 = new aws.S3({
    accessKeyId : S3_ACCESS_KEY,
    secretAccessKey : S3_SECRET_ACCESS_KEY,
    region : S3_REGION
})
export default s3
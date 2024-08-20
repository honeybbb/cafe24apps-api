const uploadModel = require("../model/upload.model");
const renewModel = require("../model/renew.model");
const Client = require("ssh2-sftp-client");
const crypto = require("crypto");
const renewService = require("./renew.service");
const sftp = new Client();
const fs = require('fs');

exports.fileUpload = async function (req, res) {
    // console.log(req.files, req.params, 'file')
    let seq = req.params.seq,
        mallId = req.body.mallId,
        bcode = req.body.bcode,
        fileInput = req.files.file1,
        fileInput2 = req.files.file2;

    console.log(seq, mallId, fileInput, fileInput2)

    try {
        let result = await uploadModel.fileUpload(fileInput[0].filename, fileInput2[0].filename, seq)
        let pcUpload = await exports.ftpFileUploadOld.bind(this)(mallId, `uploads/${fileInput[0].filename}`, `/renewImg/image/pc/${bcode}/${fileInput[0].filename}`)
        let moUpload = await exports.ftpFileUploadOld.bind(this)(mallId, `uploads/${fileInput2[0].filename}`, `/renewImg/image/m/${bcode}/${fileInput2[0].filename}`)

        console.log(pcUpload, moUpload, 'res uploads')

        res.json({
            "result": true,
            "data": result
        })
    }catch (e) {
        console.log(e, "db 저장을 실패하였습니다.")
        res.status(400).json({ success: false, message: 'file is not exist.' });
    }

    //let pcUpload = await this.ftpFileUploadOld(mallId, `/uploads/${fileInput[0].filename}`, `${mallId}.cafe24.com/renewImg/image/pc/${bcode}`);
    //let moUpload = await this.ftpFileUploadOld(mallId, `/uploads/${fileInput[0].filename}`, `${mallId}.cafe24.com/renewImg/image/m/${bcode}`);



   /*
    let mallId = req.body.mallId,
        fileInput = req.files.file1,
        fileInput2 = req.files.file2,
        uploadPath = req.body.uploadPath,
        prefix = req.body.prefix,
        maxSizeMB = req.body.maxSizeMB,
        style = 'file';
        //ftpPath = req.body.ftpPath;

    const allowedExtensions = '#|jpg|jpeg|gif|bmp|png|';
    const restrictedExtensions = '#|alz|aspx|asp|asa|asax|htm|html|php|php3|jsp|js|vbs|css|xml|ini|config|cab|dll|exe|sql|msi|';

    const file = fileInput.files[0];
    if (file) {
        const fileNameOrg = file.name;
        const fileExtension = fileNameOrg.split('.').pop().toLowerCase();
        const randNum = Math.floor(Math.random() * (9999 - 100 + 1)) + 100;
        const fileNewName = `${prefix}${new Date().toISOString().replace(/[-:.]/g, '')}${randNum}.${fileExtension}`;

        let typeProc = false;
        let sizeProc = false;
        let fileSizeResult = '';
        let fileWidth = 0;
        let fileHeight = 0;

        // 파일 확장자 검사
        if (!restrictedExtensions.includes(`|${fileExtension}|`)) {
            if (style === 'image' && allowedExtensions.includes(`|${fileExtension}|`)) {
                typeProc = true;
            } else if (style !== 'image') {
                typeProc = true;
            }

            // 파일 크기 검사
            if (typeProc && file.size < maxSizeMB * 1024 * 1024) {
                sizeProc = true;

                // 파일 읽기
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = function() {
                        fileWidth = img.width;
                        fileHeight = img.height;
                        this.ftpFileUploadOld(mallId, file, uploadPath + fileNewName); // 업로드 함수 호출
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);

                // 파일 크기 결과 설정
                if (file.size >= 1048576) {
                    fileSizeResult = `${Math.floor(file.size / 1048576)}Mb`;
                } else if (file.size >= 1024) {
                    fileSizeResult = `${Math.floor(file.size / 1024)}Kb`;
                } else {
                    fileSizeResult = `${file.size}Byte`;
                }
            }
        }

        res.json({
            "result": true,
            "data": [fileNameOrg, fileNewName, fileSizeResult, typeProc, sizeProc, fileWidth, fileHeight]
        })
    }

    */
}

exports.ftpFileUploadOld = async function (mallId, pUpFile, pPath)
{
    let encrypted = await renewModel.getFtpInfo(mallId);

    const iv = crypto.randomBytes(16); //초기화 벡터. 더 강력한 암호화를 위해 사용. 랜덤값이 좋음
    let hash = {
        iv: encrypted.iv,
        encrypted: encrypted.ftp_pass
    }

    let pass = await renewService.restoreHashPass(hash)

    encrypted.ftp_pass = pass

    /*
    const ssh_host = 'mall66.ftp.cafe24.com';
    const ssh_auth_user = 'mall66';
    const ssh_auth_pass = 'qkr8811500*';
    const ssh_port = 3822;

     */

    const ssh_host = `${mallId}.ftp.cafe24.com`;
    const ssh_auth_user = mallId;
    const ssh_auth_pass = `${encrypted.ftp_pass}`;
    const ssh_port = 3822;

    try {
        // Connect to the SFTP server
        await sftp.connect({
            host: ssh_host,
            port: ssh_port,
            username: ssh_auth_user,
            password: ssh_auth_pass
        });

        // Extract directory path from pPath
        const remoteDir = pPath.substring(0, pPath.lastIndexOf('/'));

        // Check if the directory exists, if not, create it
        const exists = await sftp.exists(remoteDir);
        if (!exists) {
            console.log(`Remote directory ${remoteDir} does not exist. Creating...`);
            await sftp.mkdir(remoteDir, true); // Recursive creation
        }

        // 로컬 파일이 존재하는지 확인
        if (!fs.existsSync(pUpFile)) {
            console.error(`Local file ${pUpFile} does not exist.`);
            return false;
        }

        // Upload the file
        await sftp.put(pUpFile, pPath);

        console.log('File uploaded successfully.');
        return true;
    } catch (err) {
        console.error('Failed to upload file:', err);
        return false;
    } finally {
        // Close the connection
        await sftp.end();
    }
}

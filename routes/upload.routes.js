const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // const folderName = req.params.nFolderName; // 폴더 이름을 요청 본문에서 가져옴
        // const dir = path.join(__dirname, 'up_file', folderName);

        const dir = path.join(__dirname, '../uploads');

        // 디렉토리가 없으면 생성
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // cb(null, `${cnt}_${Date.now()}${path.extname(file.originalname)}`);
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    }
});

// 파일 필터링
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/; // 허용되는 이미지 파일 형식
    const mimeType = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extname) {
        return cb(null, true);
    }
    cb(new Error('ERR_MIME_TYPE')); // MIME 타입 오류
};

// 미들웨어 등록
// const upload = multer({ dest: 'uploads/' }); // 'uploads/' is the folder where files will be temporarily stored
// const upload = multer({ storage: multer.memoryStorage() });
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadService = require('../service/upload.service');

module.exports = function (app) {
    app.route('/api/v1/upload/group/process').post(
        async (req, res) => {
        // html을 만들어서 upload 시키는 것
        let mallId = req.body.mallId,
            bcode = req.body.bcode,
            scode = req.body.scode,
            pc_html = req.body.pc_html,
            mo_html = req.body.mo_html;

        console.log(mallId, bcode, scode, pc_html, mo_html);

        const nFolderName = bcode;
        const skin_code = scode; // Replace with actual pc_skin logic

        //const fileName = `${path.basename(nFolderName)}.html`;
        const fileName = `${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}.html`;
        //const uploadPath = `/sde_design/${skin_code}/api/${nFolderName}/${fileName}`;
        const uploadPath = `/sde_design/${skin_code}/api/${nFolderName}.html`;

        // Read the uploaded file and convert to the necessary HTML format (if needed)
        const htmlContent = `${pc_html}`;
        const tempFilePath = `uploads/${fileName}`;
/*
        if (!fs.existsSync(tempFilePath)) {
            fs.mkdirSync(tempFilePath, { recursive: true });
        }

 */

        try {
            // Save the processed content to a temporary file
            fs.writeFileSync(tempFilePath, htmlContent, 'utf-8');
        }catch (error) {
            console.error('파일 작성 중 오류 발생:', error);
            res.status(500).send('파일 작성 중 오류가 발생했습니다.');
            return;
        }

        try {
            // SFTP 서버로 파일 업로드
            const result = await uploadService.ftpFileUploadOld(mallId, tempFilePath, uploadPath);

            if (result) {
                res.send('File uploaded and transferred via SFTP successfully.');
            } else {
                res.status(500).send('Failed to upload file via SFTP.');
            }
        } catch (error) {
            console.error('SFTP 업로드 중 오류 발생:', error);
            res.status(500).send('SFTP 업로드 중 오류가 발생했습니다.');
        } finally {
            // 임시 파일 삭제
            fs.unlinkSync(tempFilePath);
        }
    });

    // 파일 업로드 라우트
    app.route('/api/v1/upload/:seq').post(
        upload.fields([
            { name: 'file1' },
            { name: 'file2' }
        ]),
        uploadService.fileUpload
/*
        async (req, res) => {
            try {
                const seq = req.params.seq,
                    mallId = req.body.mallId,
                    pUpFile = req.files;

                console.log(seq, mallId, pUpFile)
                return;

                let result = uploadService.ftpFileUploadOld(mallId, pUpFile, pPath)

                res.json({
                    result: true,
                    data: result
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({ result: false, message: '파일 업로드에 실패했습니다.' });
            }
        }

 */

    )
}

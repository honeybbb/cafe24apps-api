'use strict';
const axios = require("axios");
const renewModel = require("../model/renew.model")
const renewService = require('../service/renew.service')
const ftp = require("basic-ftp")
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// 앱최초실행 -> 인증코드 요청 -> 인증코드 받을 URL (발급)
// 인증코드로 액세스 토큰 발급 요청 -> 액세스 토큰 발급 (db) 저장
// 데이터 요청 -> 액세스 토큰 가져와서 API req
// API res
module.exports = function (app) {
    // ftp 정보 저장
    app.route('/api/v1/ftp/info/:id').post(
        async (req, res) => {
            let mallId = req.params.id,
                ftpUser = req.body.ftpUser,
                ftpPass = req.body.ftpPass;

            if (!ftpUser) {
                return res.status(400).json({ success: false, message: 'ftpUser is required' });
            }

            if (!ftpPass) {
                return res.status(400).json({ success: false, message: 'ftpPass is required' });
            }
/*
            let salt = bcrypt.genSaltSync(10);
            let hash = bcrypt.hashSync(ftpPass, salt);

 */
            let hash = await renewService.createdHashPass(ftpPass);

            console.log(hash)

            //let restore = await renewService.restoreHashPass(hash); // 복호화

            //console.log(restore)


            let result = await renewModel.saveFtpInfo(mallId, ftpUser, hash.encrypted, hash.iv);

            res.json({
                "success": true,
                "data": result
            })

        }
    )

    // ftp 정보 조회
    app.route('/api/v1/ftp/info/:id').get(
        async (req, res) => {
            let mallId = req.params.id;
            let encrypted = await renewModel.getFtpInfo(mallId);

            const iv = crypto.randomBytes(16); //초기화 벡터. 더 강력한 암호화를 위해 사용. 랜덤값이 좋음
            let hash = {
                iv: encrypted.iv,
                encrypted: encrypted.ftp_pass
            }

            let pass = await renewService.restoreHashPass(hash)

            encrypted.ftp_pass = pass

            res.json({
                "success": true,
                "data": encrypted
            })
        }
    )

    app.route('/api/v1/auth/code').post(
        // RedirectURL - 인증 코드를 리다이렉트 받을 URI
        async (req, res) => {
            const mallId = req.query.mallId;
            const code = req.query.code;

            let token;

            try {
                token = await renewService.getCafe24Oauth2AccessToken(mallId, code);

                //await renewService.needRefreshAccessToken(token)

                //token = await renewService.getCafe24Oauth2AccessTokenUsingRefreshToken(mallId, code);
                //let cafe24Oauth2Token = await renewService.saveOrUpdate(token);
                res.json({
                    "success": true,
                    "data": token //인증코드
                })
            } catch (e) {
                res.status(500).json({ success: false });
            }
        }
    )

    // pc스킨 가져오기
    app.route('/api/v1/theme/pc').get(
        async (req, res) => {
            let mallId = req.query.mallId,
                accessToken = await renewModel.findByMallIdAndUserId(mallId);
                accessToken = accessToken[0].access_token
            const authorization = `Bearer ${accessToken}`
            let result;

            //console.log(mallId, 'mId')

            try {
                await axios.get(`https://${mallId}.cafe24api.com/api/v2/admin/themes?type=pc`, {
                    headers: {
                        "Authorization" : authorization,
                        "Content-Type": "application/json"
                    }
                }).then(res => {
                    result = res.data.themes
                })

                res.json({
                    "success": true,
                    "data": result //themes
                })
            }catch (e) {
                res.status(500).json({success: false})
            }
        }
    )

    // 모바일 스킨 가져오기
    app.route('/api/v1/theme/mobile').get(
        async (req, res) => {
            let mallId = req.query.mallId,
                accessToken = await renewModel.findByMallIdAndUserId(mallId);
                accessToken = accessToken[0].access_token
            const authorization = `Bearer ${accessToken}`
            let result;

            try {
                await axios.get(`https://${mallId}.cafe24api.com/api/v2/admin/themes?type=mobile`, {
                    headers: {
                        "Authorization" : authorization,
                        "Content-Type": "application/json"
                    }
                }).then(res => {
                    result = res.data.themes
                })

                res.json({
                    "success": true,
                    "data": result //themes
                })
            }catch (e) {
                res.status(500).json({success: false})
            }
        }
    )

    // 저장된 스킨 조회
    app.route('/api/v1/theme/list').get(
        async (req, res) => {
            let mallId = req.query.mallId;
            //console.log('theme list', mallId)

            let result = await renewModel.getSkinList(mallId)

            res.json({
                "result": true,
                "data": result
            })
        }
    )

    // 스킨 삭제
    app.route('/api/v1/theme/list/delete').delete(
        async (req, res) => {
            let mallId = req.query.mallId,
                scode = req.query.scode;

            let result = await renewModel.DelSkinList(mallId, scode);

            res.json({
                "result": true,
                "data": result
            })
        }
    )

    //중복 체크
    app.route('/api/v1/theme/list/check').post(
        async (req, res) => {
            let mallId = req.body.mallId,
                skinName = req.body.skinName,
                skinCode = req.body.skinCode;

            let result = await renewModel.checkSkinList(mallId, skinName, skinCode);

            res.json({
                "result": true,
                "data": result
            })
        }
    )

    app.route('/api/v1/theme/list/add').post(
        async (req, res) => {
            let mallId = req.body.mallId,
                skinName = req.body.skinName,
                skinCode = req.body.skinCode,
                type = req.body.type;

            let result = await renewModel.setSkinList(mallId, skinName, skinCode, type);

            res.json({
                "result": true,
                "data": result
            })
        }
    )

    // 배너 그룹 목록 조회
    app.route('/api/v1/board/group').get(
        async (req, res) => {
            let skinCode = req.query.skinCode,
                mallId = req.query.mallId;

            let result = await renewModel.getBoardGroup(skinCode, mallId)

            res.json({
                "result": true,
                "data": result
            })

        }
    )

    // 배너 그룹 저장
    app.route('/api/v1/board/group/add').post(
        async (req, res) => {
            let skinCode = req.body.s_code,
                title = req.body.title,
                description = req.body.description,
                sort = req.body.g_sort,
                displayYn = req.body.displayYn,
                mallId = req.body.mallId;

            let bannerCode = await renewService.makeRandomId(6);

            console.log(skinCode, bannerCode, title, description, sort, displayYn, mallId)

            let result = await renewModel.setBoardGroup(skinCode, bannerCode, title, description, sort, displayYn, mallId);

            res.json({
                "result": true,
                "data": result
            })

        }
    )

    // 배너 그룹 수정
    app.route('/api/v1/board/group/update/:mallId').post(
        async (req, res) => {
            let mallId = req.params.id,
                title = req.body.title,
                description = req.body.description,
                displayYn = req.body.displayYn,
                seq = req.body.seq,
                bcode = req.body.bcode;

            let result = await renewModel.updateBoardGroup(title, description, displayYn, seq, bcode, mallId);

            res.json({
                "result": true,
                "data": result
            })
        }
    )

    // 배너 그룹 삭제
    app.route('/api/v1/board/group/delete/:id').delete(
        async (req, res) => {
            let mallId = req.params.id,
                bcode = req.query.bcode;

            console.log(bcode, mallId, 'DelBoardGroup')

            let result = await renewModel.DelBoardGroup(bcode, mallId);

            res.json({
                "result": true,
                "data": result
            })
        }
    )

    app.route('/api/v1/board/group/display/:id').post(
        async (req, res) => {
            let mallId = req.params.id,
                bcode = req.body.bcode,
                displayYn = req.body.displayYn;

            console.log(mallId, bcode, displayYn)

            let result = await renewModel.updateBoardDisplay(displayYn, bcode, mallId);

            res.json({
                "result": true,
                "data": result
            })
        }
    )

    // 배너 컨텐츠 조회
    app.route('/api/v1/board/content/:bcode').get(
        async (req, res) => {
            let bcode = req.params.bcode;

            let result = await renewModel.getBoardContent(bcode);

            res.json({
                "result": true,
                "data": result
            })
        }
    )

    // 클릭 수 저장
    app.route('/api/v1/board/content/click/view').post(
        async (req, res) => {
            let seq = req.body.seq;

            let result = await renewModel.setClickView(seq);

            res.json({
                "result": true,
                "data": result
            })
        }
    )
/*
    app.route('/api/v1/board/content/add/img').post(
        async (req, res) => {
            let result = "";

            res.json({
                "result": true,
                "data": result
            })
        }
    )

 */

    app.route('/api/v1/board/content/add').post(
        async (req, res) => {
            let bcode = req.body.bcode,
                title = req.body.title,
                description = req.body.description,
                link = req.body.link,
                file_edit1 = req.body.file_edit1,
                file_edit2 = req.body.file_edit2,
                subSort = req.body.subSort,
                displayYn = req.body.displayYn,
                showStartDt = req.body.showStartDt,
                showEndDt = req.body.showEndDt,
                checkShow = req.body.checkShow;

            if(showStartDt == undefined || showStartDt == null) showStartDt = '0000-00-00 00:00:00'
            if(showEndDt == undefined || showEndDt == null) showEndDt = '0000-00-00 00:00:00'

            let result = await renewModel.setBoardContent(
                bcode,
                title,
                description,
                link,
                file_edit1,
                file_edit2,
                subSort,
                displayYn,
                showStartDt,
                showEndDt,
                checkShow
            );

            res.json({
                "result": true,
                "data": result
            });
        }
    )

    app.route('/api/v1/board/content/add/img').post(
        async (req, res) => {

            const client = new ftp.Client();
            client.ftp.verbose = true; // 통신 상세 과정 볼거면 true, 아니면 false

            try {
                await client.access({
                    host: "renewwave.ftp.cafe24.com",
                    user: "renewwave",
                    password: "dlghdtjr0305", // type: string!!
                });

                await client.cd("/Server"); // 서버에 접속 후, 업로드할 폴더로 이동
                await client.uploadFrom(
                    "어떤이름으로 업로드?",
                    "어떤 파일 가져올것?"
                );
            } catch (err) {
                console.log(err);
                client.close();
                return false;
            }

            client.close();
            return true;
        }
    )

    // 배너 컨텐츠 수정
    app.route('/api/v1/board/content/update/:seq').post(
        async (req, res) => {
            let seq = req.params.seq,
                bcode = req.body.bcode,
                title = req.body.title,
                desc = req.body.desc,
                link = req.body.link,
                subSort = req.body.subSort,
                displayYn = req.body.displayYn,
                showStartDt = req.body.showStartDt,
                showEndDt = req.body.showEndDt,
                checkShow = req.body.checkShow;

            let result = await renewModel.updateBoardContent(title, desc, link, subSort, displayYn, showStartDt, showEndDt, checkShow, bcode, seq);

            res.json({
                "result": true,
                "data": result
            })
        }
    )

    // 배너 컨텐츠 삭제
    app.route('/api/v1/board/content/delete').delete(
        async (req, res) => {
            let seq = req.query.seq,
                bcode = req.query.bcode;

            let result = await renewModel.DelBoardContent(bcode, seq);

            res.json({
                "result": true,
                "data": result
            })
        }
    )

    // 데이터 전송(api파일 보내기)
    app.route('/api/v1/board/group/process').post(
        async (req, res) => {
            let mallId = req.body.mallId,
                bcode = req.body.bcode,
                htmlFile = req.body.htmlFile;

            // mallId로 접속해서 ftp 연결 -> /스킨폴더/api/배너코드.html
            // .html 파일엔 div로 요소 들어있음

        }
    )
}

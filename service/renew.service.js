const renewModel = require('../model/renew.model')
const axios = require("axios");
let Client = require('ssh2-sftp-client');
const { encode } = require("querystring");
let CLIENT_ID = 'G25q6BtQMRTnrqH0CxDNCA';
let CLIENT_SECRET = '4eG9QZYkQCob1DlhRCPgWF';
let REDIRECT_URL = 'https://webpb.renewwave.co.kr/api/v1/cafe24/auth/code';
// let CAFE24_OAUTH2_URL = 'https://renewwave.cafe24api.com/api/v2/oauth/authorize'
let SCOPES = [
    'mall.read_design'
];
const crypto = require("crypto");

exports.createdHashPass = async function (ftpPass) {
    /*
    let hash = crypto.createHash('sha1');
    hash.update(ftpPass);
    return hash.digest("hex");

     */

    const algorithm = 'aes-256-cbc';
    let text = ftpPass; // 암호화 할 문구
    const key = crypto.scryptSync('RENEWWAVE!','specialSalt', 32); // 나만의 암호화키. password, salt, byte 순인데 password와 salt는 본인이 원하는 문구로~
    const iv = crypto.randomBytes(16); //초기화 벡터. 더 강력한 암호화를 위해 사용. 랜덤값이 좋음

    const cipher = crypto.createCipheriv(algorithm, key, iv); //key는 32바이트, iv는 16바이트
    let result = cipher.update(text, 'utf8', 'base64');
    result += cipher.final('base64');

    return {
        iv: iv.toString('base64'),
        encrypted: result
    };
}

exports.restoreHashPass = async function (hash) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync('RENEWWAVE!','specialSalt', 32); // 나만의 암호화키. password, salt, byte 순인데 password와 salt는 본인이 원하는 문구로~
    const iv = Buffer.from(hash.iv, 'base64'); // IV를 base64에서 Buffer로 변환

    const deciper = crypto.createDecipheriv(algorithm, key, iv);
    let result2 = deciper.update(hash.encrypted, 'base64', 'utf8');
    result2 += deciper.final('utf8');
    console.log('복호화: ', result2);
    return result2; // 복호화된 문자열 반환
}
// 1) 인증 코드 요청

// 3) 액세스 토큰 발급 요청
exports.getCafe24Oauth2AccessToken = async function (mallId, code) {
    //let authorization = "Basic " + base64.encode(CLIENT_ID + ":" + CLIENT_SECRET);
    let authorization = "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    let params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URL
    });

    try {
        const response = await axios.post(`https://${mallId}.cafe24api.com/api/v2/oauth/token`, params, {
            headers: {
                'Authorization': authorization,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching OAuth2 access token');
    }
}

// 토큰 재발급
exports.getCafe24Oauth2AccessTokenUsingRefreshToken = async function (mallId, refreshToken) {
    let authorization = "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    let params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
    });

    try {
        const response = await axios.post('https://renewwave.cafe24api.com/api/v2/oauth/token', params, {
            headers: {
                'Authorization': authorization,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching OAuth2 access token');
    }
}

// 토큰 유효기간 확인
exports.needRefreshAccessToken = async function (token) {
    return
}

exports.saveOrUpdate = async function (token) {
    let cafe24Token = await renewModel.findByMallIdAndUserId(token.mall_id);
    let result;
    let accessToken = token.access_token,
        expiresAt = token.expires_at,
        refreshToken = token.refresh_token,
        refreshTokenExpiresAt = token.refresh_token_expires_at,
        issuedAt = token.issued_at,
        mallId = token.mall_id;
    if(cafe24Token) {
        result = await renewModel.updateToken(accessToken, expiresAt, refreshToken, refreshTokenExpiresAt, issuedAt, mallId)
        return result
    } else {
        result = await renewModel.saveToken(accessToken, expiresAt, refreshToken, refreshTokenExpiresAt, issuedAt, mallId)
        return result
    }

}
/*
{
  "access_token": "{access_token}",
  "expires_at": "{expiration_date_of_access_token}",
  "refresh_token": "{refresh_token}",
  "refresh_token_expires_at": "{expiration_date_of_refresh_token}",
  "client_id": "{client_id}",
  "mall_id": "{mall_id}",
  "user_id": "{user_id}",
  "scopes": [
    "{scopes_1}",
    "{scopes_2}"
  ],
  "issued_at": "{issued_date}"
}
 */
exports.makeRandomId = async function (length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    let cnt = 0;

    while (cnt < length) {

        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        cnt += 1;

    }

    return result;
}

exports.sftpConnect = async function (user, pass, mallId, port) {
    let sftp = new Client();
    // client.ftp.verbose = true; //자세한 통신과정을 보고 싶으면 true, 생략하고 싶으면 false로 설정

    try {
        await sftp.connect({
            host: `${mallId}.cafe24.com`,
            port: `${port}`,
            user: user,
            password: pass
        })

    } catch (err) {
        console.log(err);
        this.sftpDisconnect();
        return false;
    }
}

exports.sftpDisconnect = async function () {
    await Client.end();
}

exports.uploadFile = async function (localFile, remoteFile) {
    console.log(`Uploading ${localFile} to ${remoteFile} ...`);
    try {
        await Client.put(localFile, remoteFile);
    } catch (err) {
        console.error('Uploading failed:', err);
    }
}

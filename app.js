const express = require('express');
const cors = require('cors'); // cors 미들웨어 추가
const axios = require('axios');
const app = express();
const port = 3009;

app.use(cors() );
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 1) 앱 최초 실행 (최초 실행인 경우 권한 위임 절차를 진행)
// 2) 인증코드 요청 필요
// 3) 인증코드 발급 필요 (Redirect URI를 통해 인증 코드가 발급)
// 4) 발급 받은 인증코드로 액세스 토큰 요청 필요
// 5) 인증 코드가 확인되면 "액세스 토큰"이 발급
// 데이터 요청 시, 액세스 토큰으로 API request -> response

let CAFE24_THEMES_URL = 'https://renewwave.cafe24api.com/api/v2/admin/themes';
/*
{
    "themes": [
        {
            "skin_no": 3,
            "skin_code": "skin2",
            "skin_name": "My Shop Default Theme",
            "skin_thumbnail_url": "https://img.echosting.cafe24.com/smartAdmin/img/design/img_skin_default.jpg",
            "usage_type": "C",
            "editor_type": "H",
            "parent_skin_no": 1,
            "seller_id": null,
            "seller_skin_code": null,
            "design_purchase_no": 0,
            "design_product_code": null,
            "language_code": "ko_KR",
            "published_in": "unpublished",
            "created_date": "2017-12-20T17:03:24+09:00",
            "updated_date": "2017-12-20T17:03:24+09:00",
            "preview_domain": [
                "https://myshop.cafe24.com/skin-skin2",
                "https://myshop.cafe24.com/shop1/skin-skin2"
            ]
        },
        {
            "skin_no": 1,
            "skin_code": "skin1",
            "skin_name": "My Shop Old Theme",
            "skin_thumbnail_url": "https://img.echosting.cafe24.com/smartAdmin/img/design/img_skin_default.jpg",
            "usage_type": "S",
            "editor_type": "D",
            "parent_skin_no": null,
            "seller_id": null,
            "seller_skin_code": null,
            "design_purchase_no": 0,
            "design_product_code": null,
            "language_code": "ko_KR",
            "published_in": "1",
            "created_date": "2016-10-04T22:52:43+09:00",
            "updated_date": null,
            "preview_domain": [
                "https://myshop.cafe24.com/skin-skin1",
                "https://myshop.cafe24.com/shop1/skin-skin1"
            ]
        }
    ]
}
*/


var renewRoutes = require('./routes/renew.routes');
renewRoutes(app);
var uploadRoutes = require('./routes/upload.routes');
uploadRoutes(app);

app.listen(port, () => {
    console.log(`server is listening at localhost:${port}`);
});

module.exports = app;

// client(앱) : 쇼핑몰 운영자에게 API 호출에 대한 권한동의 승인 요청 -> cafe24 인증코드 발급
// client(앱) : 호출 가능한 자격 증명 위한 액세스 토큰 발급 요청 -> cafe 액세스 토큰 발급
// client(앱) : 액세스 토큰 사용하여 API 요청 -> API 응답
// RO : 데이터 요청 -> client(앱) 데이터 확인

/* 최초실행 시
https://{{AppUrl}}/?is_multi_shop={{멀티쇼핑몰여부}}
&lang={{쇼핑몰언어}}
&mall_id={{mall_id}}
&shop_no={{shop_no}}
& timestamp= {{timestamp}}
& user_id={{로그인아이디}}
&user_name={{로그인사용자이름}}
&user_type={{사용자유형}}
&hmac={{검증용 key}}
 */

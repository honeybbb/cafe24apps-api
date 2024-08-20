const pool = require('../config/mysqlConfig');
const mysql = require('mysql2');

exports.saveFtpInfo = async function (mallId, ftpUser, ftpPass, iv) {
    let sql = "insert into new_tb_cafe24_ftp_info (mall_id, ftp_user, ftp_pass, iv) values (?, ?, ?, ?)";
    let aParameter = [mallId, ftpUser, ftpPass, iv];

    let query = mysql.format(sql, aParameter);
    try {
        let res = await pool.query(query);
        return res;
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}

exports.getFtpInfo = async function (mallId) {
    let sql = "select * from new_tb_cafe24_ftp_info where mall_id = ?";
    let aParameter = [mallId];

    let query = mysql.format(sql, aParameter);
    try {
        let res = await pool.query(query);
        return res[0];
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}

exports.findByMallIdAndUserId = async function (mallId) {
    let sql = "select * from new_tb_cafe24_tokens where mall_id = ?";
    let aParameter = [mallId];

    let query = mysql.format(sql, aParameter);
    try {
        let res = await pool.query(query);
        return res;
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}

exports.updateToken = async function (accessToken, expiresAt, refreshToken, refreshTokenExpiresAt, issuedAt, mallId) {
    let sql = "update new_tb_cafe24_tokens set access_token = ?, expires_at =?, refresh_token = ?,"
    sql += " refresh_token_expires_at=?, issued_at=? where mall_id = ?";
    let aParameter = [accessToken, expiresAt, refreshToken, refreshTokenExpiresAt, issuedAt, mallId];

    let query = mysql.format(sql, aParameter);
    try {
        let res = await pool.query(query);
        return res;
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}

exports.saveToken = async function (accessToken, expiresAt, refreshToken, refreshTokenExpiresAt, issuedAt, mallId) {
    let sql = "insert into new_tb_cafe24_tokens (access_token, expires_at, refresh_token, refresh_token_expires_at, issued_at, mall_id)";
    sql += " values (?,?,?,?,?,?)"
    let aParameter = [accessToken, expiresAt, refreshToken, refreshTokenExpiresAt, issuedAt, mallId];

    let query = mysql.format(sql, aParameter);
    try {
        let res = await pool.query(query);
        return res;
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}

exports.getSkinList = async function (mallId) {
    let sql = "select * from new_tb_skin_list where mall_id = ?"
    let aParameter = [mallId];

    let query = mysql.format(sql, aParameter);
    try {
        let res = await pool.query(query);
        return res;
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}

exports.DelSkinList = async function (mallId, scode) {
    let sql = "delete from new_tb_skin_list where mall_id = ? and s_code = ?"
    let aParameter = [mallId, scode];

    let query = mysql.format(sql, aParameter);
    try {
        let res = await pool.query(query);
        return res;
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}

exports.checkSkinList = async function (mallId, skinName, skinCode) {
    let sql = "select * from new_tb_skin_list where mall_id = ? and s_name =? and s_code =?";
    let aParameter = [mallId, skinName, skinCode];

    let query = mysql.format(sql, aParameter);
    try {
        let res = await pool.query(query);
        return res;
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}

exports.setSkinList = async function (mallId, skinName, skinCode, type){
    let sql = "insert into new_tb_skin_list (mall_id, s_name, s_code, type) values (?, ?, ?, ?)";
    let aParameter = [mallId, skinName, skinCode, type];

    let query = mysql.format(sql, aParameter);
    try {
        let res = await pool.query(query);
        return res;
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}

exports.getBoardGroup = async function(skinCode, mallId) {
    let sql = "select * from new_tb_board_group where s_code = ? and mall_id = ?";
    let aParameter = [skinCode, mallId];

    let query = mysql.format(sql, aParameter);
    try {
        let res = await pool.query(query);
        return res;
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }

}

exports.setBoardGroup = async function (skinCode, bannerCode, title, description, sort, displayYn, mallId) {
    let sql = "insert into new_tb_board_group (s_code, b_code, title, description, sort, displayYn, mall_id) values (?, ?, ?, ?, ?, ?, ?)";
    let aParameter = [skinCode, bannerCode, title, description, sort, displayYn, mallId];

    let query = mysql.format(sql, aParameter);
    try {
        let res = await pool.query(query);
        return res;
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}

exports.updateBoardGroup = async function (title, description, displayYn, seq, bcode, mallId) {
    let sql = "update new_tb_board_group set title=?, description=?, displayYn=?"
    sql += " where seq=? and b_code=? and mall_id=?"
    let aParameter = [title, description, displayYn, seq, bcode, mallId];

    let query = mysql.format(sql, aParameter);
    try {
        let res = await pool.query(query);
        return res;
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}

exports.DelBoardGroup = async function (bcode, mallId) {
    let sql = "delete from new_tb_board_group where b_code = ? and mall_id = ?"
    let aParameter = [bcode, mallId];

    let query = mysql.format(sql, aParameter);
    try {
        let res = await pool.query(query);
        return res;
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}

exports.updateBoardDisplay = async function (displayYn, bcode, mallId) {
    let sql = "update new_tb_board_group set displayYn = ? where b_code = ? and mall_id = ?"
    let aParameter = [displayYn, bcode, mallId];

    let query = mysql.format(sql, aParameter);
    try {
        let res = await pool.query(query);
        return res;
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}

exports.getBoardContent = async function (bcode) {
    let sql = "select * from new_tb_board_content where b_code = ?"
    let aParameter = [bcode];

    let query = mysql.format(sql, aParameter);
    try {
        let res = await pool.query(query);
        return res;
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}

exports.setClickView = async function (seq) {
    let sql = "update new_tb_board_content set click_view = click_view + 1 where seq = ?";
    let aParameter = [seq];

    let query = mysql.format(sql, aParameter);
    try {
        let res = await pool.query(query);
        return res;
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}

exports.setBoardContent = async function (bannerCode, title, description, link, fileEdit1, fileEdit2, subSort, displayYn, showStartDt, showEndDt, checkShow) {
    let sql = "insert into new_tb_board_content (b_code, title, description, link, file_edit1, file_edit2, sub_sort, displayYn, showStartDt, showEndDt, checkShow)"
    sql += " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    let aParameter = [bannerCode, title, description, link, fileEdit1, fileEdit2, subSort, displayYn, showStartDt, showEndDt, checkShow];

    let query = mysql.format(sql, aParameter);
    try {
        let res = await pool.query(query);
        return res;
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}

exports.updateBoardContent = async function (title, desc, link, subSort, displayYn, showStartDt, showEndDt, checkShow, bcode, seq) {
    console.log(title, desc, link, subSort, displayYn, showStartDt, showEndDt, checkShow, bcode, seq)
    let sql = "update new_tb_board_content set title=?, description=?, link=?, sub_sort=?, displayYn=?,"
    sql += " showStartDt=?, showEndDt=?, checkShow=?"
    sql += " where b_code = ? and seq = ?"
    let aParameter = [title, desc, link, subSort, displayYn, showStartDt, showEndDt, checkShow, bcode, seq];

    let query = mysql.format(sql, aParameter);
    try {
        let res = await pool.query(query);
        return res;
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}

exports.DelBoardContent = async function (bcode, seq) {
    let sql = "delete from new_tb_board_content where b_code = ? and seq =?"
    let aParameter = [bcode, seq];

    let query = mysql.format(sql, aParameter);
    try {
        let res = await pool.query(query);
        return res;
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}

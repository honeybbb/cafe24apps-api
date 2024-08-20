const mysql = require("mysql2");
const pool = require("../config/mysqlConfig");
const {randomBytes} = require("crypto");
const crypto = require("crypto");
/*
exports.fileUpload = async function (bcode, file1, file2) {
    let sql = 'update `new_tb_board_content` set `b_code` = ?, `file_edit1` = ?, `file_edit2` = ? where `b_code` = ?';
    let aParameter = [bcode, file1, file2];
    let query = mysql.format(sql, aParameter);
    try {
        return await pool.query(query);
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}

 */
exports.fileUpload = async function (file_edit1, file_edit2, seq) {
    let sql = "update new_tb_board_content set file_edit1=?, file_edit2=? where seq = ?"
    let aParameter = [file_edit1, file_edit2, seq];
    let query = mysql.format(sql, aParameter);
    try {
        return await pool.query(query);
    }catch (e) {
        console.log('db err', e);
        return {'data': '-9999'}
    }
}



// 배너 추가 로직
// pcImg, mImg => fileUpload => result.file1, result.file2, others.. => setBoardContent()

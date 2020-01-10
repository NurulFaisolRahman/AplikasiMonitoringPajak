$ = require('jquery')
const moment = require('moment')
const CSVtoJSON = require('csvtojson')
const schedule = require('node-schedule')
const Store = require('./store.js')

// var URL = 'http://localhost/MonitoringPajak/Autentikasi/'
// var URL = 'http://192.168.43.223/MonitoringPajak/Autentikasi/'
var URL = 'http://192.168.1.92/MonitoringPajak/Autentikasi/'
var SinyalOnline

const store = new Store({
  configName: 'Sesi',
  defaults: {}
})

window.addEventListener('offline', () => {
  if (SinyalOnline != undefined) {
    SinyalOnline.cancel()
    console.log('SinyalOnline Cancelled')
  }
  document.getElementById("Alert").style.display = 'block'
  console.log('Internet Offline')
  if (store.get('JenisData') == 'api' && ApiUpload != undefined) {
    ApiUpload.cancel()
    console.log('ApiUpload Cancelled')
  }
  if (store.get('JenisData') == 'db' && DBUpload != undefined) {
    DBUpload.cancel()
    console.log('DBUpload Cancelled')
  }
})

window.addEventListener('online', () => {
  KirimSinyalOnline()
  console.log('SinyalOnline Started')
  document.getElementById("Alert").style.display = 'none'
  console.log('Internet Online')
  if (store.get('JenisData') == 'api') {
    UploadDataApi()
    console.log('ApiUpload Started')
  }
  if (store.get('JenisData') == 'db') {
    UploadDataDB()
    console.log('DBUpload Started')
  }
})

function KirimSinyalOnline() {
  SinyalOnline = schedule.scheduleJob('*/1 * * * *', function(){
    if (parseInt(moment().format('HH')) >= store.get('JamBuka') && parseInt(moment().format('HH')) < store.get('JamTutup')) {
      var Data = { NPWPD: store.get('NPWPD'), Sinyal: moment().format('YYYY-MM-DD HH:mm:ss') }
      $.post(URL+"UpdateSinyal", Data)
      console.log('Kirim Sinyal Online Sukses')
    }
  })
}

function Jadwal() {
  KirimSinyalOnline()
  var Buka = schedule.scheduleJob('0 0 '+store.get('JamBuka')+' * * *', function(){
      KirimSinyalOnline()
      console.log('Jam Buka')
  })
  var Tutup = schedule.scheduleJob('0 0 '+store.get('JamTutup')+' * * *', function(){
      SinyalOnline.cancel()
      console.log('Jam Tutup')
  })
}

$('#NPWPD').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
        event.preventDefault();
        document.getElementById("Login").click();  
    }
});

$('#Password').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
        event.preventDefault();
        document.getElementById("Login").click();  
    }
});

$('#Login').on('click', () => {
  if ($('#NPWPD').val() == '') {
    alert('Mohon Input NPWPD')
  } else if ($('#Password').val() == '') {
    alert('Mohon Input Password')
  } else {
    var Akun = { NPWPD: $('#NPWPD').val(),Password: $('#Password').val() }
    $.post(URL+"/AutentikasiWajibPajak", Akun).done(function(pesan) {
      if (pesan == 'ok') {
        document.getElementById("Autentikasi").style.display = 'none'
        document.getElementById("JenisData").style.display = 'block'
        store.set('NPWPD', $('#NPWPD').val())
        var DataNPWPD = { NPWPD : store.get('NPWPD')};
        $.post(URL+"/JamOperasional", DataNPWPD).done(function(Respon) {
          var Pecah1 = Respon.split("-")
          var Pecah2 = Pecah1[0].split(".")
          var Pecah3 = Pecah1[1].split(".")
          store.set('JamBuka', parseInt(Pecah2[0]))
          store.set('JamKirim', parseInt(parseInt(Pecah2[0]) + ((parseInt(Pecah3[0]) - parseInt(Pecah2[0]))/2)))
          store.set('JamTutup', parseInt(Pecah3[0]))
        })
      } else if(pesan == 'ko'){
        alert('NPWPD Tidak Terdaftar DiServer')
      } else if (pesan == 'fail') {
        alert('Password Salah')
      } else if (pesan == 'Disable') {
          alert('Akun Di Non Aktifkan Oleh Server')
      } else if (pesan == 'text') {
        if (store.get('IndexText') != undefined) {
          document.getElementById('JenisText').selectedIndex = store.get('IndexText')
        } 
        document.getElementById("Autentikasi").style.display = 'none'
        document.getElementById("Uploadcsv").style.display = 'block'
      } else if (pesan == 'api') {
        if (store.get('ApiURL') != undefined) {
          document.getElementById('URLapi').value = store.get('ApiURL')
        } 
        document.getElementById("Autentikasi").style.display = 'none'
        document.getElementById("Uploadapi").style.display = 'block'
      } else if (pesan == 'db') {
        if (store.get('JenisDB') != undefined) {
          document.getElementById('JenisDB').selectedIndex = store.get('IndexDB')
        }
        if (store.get('QueryDB') != undefined) {
          document.getElementById('Querydb').value = store.get('QueryDB')
        }
        if (store.get('ServerDB') != undefined) {
          document.getElementById('Server').value = store.get('ServerDB')
        }
        if (store.get('NamaDB') != undefined) {
          document.getElementById('NamaDB').value = store.get('NamaDB')
        }
        if (store.get('UsernameDB') != undefined) {
          document.getElementById('UsernameDB').value = store.get('UsernameDB')
        }
        if (store.get('PasswordDB') != undefined) {
          document.getElementById('PasswordDB').value = store.get('PasswordDB')
        }
        document.getElementById("Autentikasi").style.display = 'none'
        document.getElementById("Uploaddb").style.display = 'block'
      }
    }).fail(function(e) {
      alert('Koneksi Gagal')
    })
  }
})

function SetJenisData(Sembunyi,Tampil,JenisData) {
  var Data = { NPWPD: store.get('NPWPD'), JenisData: JenisData }
  $.post(URL+"UpdateJenisData", Data)
  document.getElementById("JenisData").style.display = 'none'
  document.getElementById(Tampil).style.display = 'block'
}

var TextUpload

if (store.get('JenisData') == 'text') {
  Jadwal()
  UploadDataText()
}

$('#text').on('click', () => {
  SetJenisData('JenisData','Uploadcsv','text')
  store.set('JenisData', 'text')
  Jadwal()
  UploadDataText()
})

function UploadDataText() {
  store.set('JenisText', $('#JenisText').val())
  store.set('IndexText', $("#JenisText")[0].selectedIndex)
  TextUpload = schedule.scheduleJob('0 0 '+store.get('JamKirim')+' * * *', function(){
    CSVtoJSON({delimiter:'auto'}).fromFile('../WajibPajak/'+moment().format('DD-MM-YYYY')+'.'+store.get('JenisText')).then(data => {
      var DataWajibPajak = {}
      var DataText = []
      for (key in data) {
        if (Object.getOwnPropertyNames(data[key]).length == 7) {
          DataText.push(data[key])
        }
      }
      DataWajibPajak[store.get('NPWPD')] = DataText
      console.log(JSON.stringify(DataWajibPajak))
      $.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWajibPajak)).done(function(Respon) {
        if (Respon == 'ok') {
          console.log('Upload Data Text Otomatis, Sukses')
        } else {
          console.log(Respon)
        }
      })
    })
  })
}

function GantiJenisText() {
  UploadDataText()
}

$('#UploadTextManual').on('click', () => {
  document.getElementById('Uploadcsv').style.display = 'none'
  document.getElementById('TextUploadManual').style.display = 'block'
})

$('#KembaliTextManual').on('click', () => {
  document.getElementById('TextUploadManual').style.display = 'none'
  document.getElementById('Uploadcsv').style.display = 'block'
})

$("#UploadText").click(function(){
  var fileUpload = document.getElementById("DataCSV")
  var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
  if (regex.test(fileUpload.value.toLowerCase())) {
    CSVtoJSON({delimiter:'auto'}).fromFile(fileUpload.files[0].path).then(data => {
      var DataWajibPajak = {}
      //Contoh WP Setor Data Melalui Api Yang Disediakan BPPD Tanpa Install Aplikasi Desktop
      // var TesApiWP = { NPWPD: store.get('NPWPD'), 
      //                  Password: 'kekkai', 
      //                  Data : JSON.stringify(data) }
      // console.log(TesApiWP) 
      // $.post(URL+"ApiWP", JSON.stringify(TesApiWP)).done(function(Respon) {
      //   console.log(Respon)
      // })
      var DataText = []
      for (key in data) {
        if (Object.getOwnPropertyNames(data[key]).length == 7) {
          DataText.push(data[key])
        }
      }
      DataWajibPajak[store.get('NPWPD')] = DataText
      document.getElementById('TextData').value = JSON.stringify(DataText)
      $.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWajibPajak)).done(function(Respon) {
        if (Respon == 'ok') {
          alert('Data Berhasil Di Upload')
        } else {
          alert(Respon)
        }
      })
      document.getElementById('DataCSV').value = ''
    })
  }
  else {
    alert('Mohon Input Data CSV/TXT!')
    document.getElementById('DataCSV').value = ''
  }
})

if (store.get('JenisData') == 'api') {
  Jadwal()
  UploadDataApi()
}

$('#api').on('click', () => {
  SetJenisData('JenisData','Uploadapi','api')
  store.set('JenisData', 'api')
  Jadwal()
  UploadDataApi()
})

var ApiUpload

function GantiUrlApi() {
    store.set('ApiURL',$('#URLapi').val())
    console.log('Ganti Url Api = '+store.get('ApiURL'))
    UploadDataApi()
}

function IsJson(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

function UploadDataApi() {
  if (store.get('ApiURL') != '' && store.get('ApiURL') != undefined) {
    $.post(store.get('ApiURL')).done(function(Respon) {
      if (IsJson(Respon)){
        ApiUpload = schedule.scheduleJob('*/1 * * * *', function(){
          if (parseInt(moment().format('HH')) >= store.get('JamBuka') && parseInt(moment().format('HH')) < store.get('JamTutup')) {
            var DataWajibPajak = {}
            DataWajibPajak[store.get('NPWPD')] = JSON.parse(Respon)
            console.log(JSON.stringify(DataWajibPajak))
            $.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWajibPajak)).done(function(Respon) {
              if (Respon == 'ok') {
                console.log('Upload Data Api Otomatis, Sukses')
              } else {
                console.log(Respon)
              }
            })
          }
        })
      }
      else {
        alert('Respon Data Bukan JSON!')
      }
    }).fail(function() {
      alert('URL Tidak Valid!')
    })
  } 
}

$('#UploadApiManual').on('click', () => {
  document.getElementById('Uploadapi').style.display = 'none'
  document.getElementById('ApiUploadManual').style.display = 'block'
})

$('#KembaliApiManual').on('click', () => {
  document.getElementById('ApiUploadManual').style.display = 'none'
  document.getElementById('Uploadapi').style.display = 'block'
})

$('#URLapiManual').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
        event.preventDefault();
        document.getElementById("UploadApi").click();  
    }
})

// http://localhost/MonitoringPajak/Autentikasi/api

$("#UploadApi").click(function(){
    $.post($('#URLapiManual').val()).done(function(Respon) {
    if (IsJson(Respon)){
      var DataWajibPajak = {}
      DataWajibPajak[store.get('NPWPD')] = JSON.parse(Respon)
      console.log(JSON.stringify(DataWajibPajak))
      $.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWajibPajak)).done(function(Respon) {
        if (Respon == 'ok') {
          alert('Data Berhasil Di Upload')
        } else {
          alert(Respon)
        }
      })
      document.getElementById('ApiData').value = Respon
    }
    else {
      alert('Respon Data Bukan JSON!')
    }
  }).fail(function() {
    alert('URL Tidak Valid!')
  })
})

var DBUpload

if (store.get('JenisData') == 'db') {
  // Jadwal()
  // UploadDataDB()
}

$('#db').on('click', () => {
  SetJenisData('JenisData','Uploaddb','db')
  store.set('JenisData', 'db')
  Jadwal()
})

function SimpanDB(){
  store.set('QueryDB', $('#Querydb').val())
  store.set('ServerDB', $('#Server').val())
  store.set('NamaDB', $('#NamaDB').val())
  store.set('UsernameDB', $('#UsernameDB').val())
  store.set('PasswordDB', $('#PasswordDB').val())
  store.set('JenisDB', $('#JenisDB').val())
  store.set('IndexDB', $("#JenisDB")[0].selectedIndex)
  UploadDataDB()
}

$('#PasswordDB').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
      if ($('#Querydb').val() == '') {
        alert('Mohon Input Query!')
      } else if ($('#Server').val() == '') {
        alert('Mohon Input Nama Server!')
      } else if ($('#NamaDB').val() == '') {
        alert('Mohon Input Nama Database!')
      } else if ($('#UsernameDB').val() == '') {
        alert('Mohon Input Username Database!')
      } else {
        event.preventDefault();
        if ($('#JenisDB').val() == 'Postgre') {
          const {Pool,Client} = require('pg')
          const connectionString = "postgressql://"+$('#UsernameDB').val()+":"+$('#PasswordDB').val()+"@"+$('#Server').val()+":5432/"+$('#NamaDB').val();
          const client = new Client({
            connectionString:connectionString
          })
          client.connect(err => {
            if (err) {
              alert('Koneksi Gagal')
            } else {
              SimpanDB()
              alert('Koneksi Berhasil')
            }
          })
          client.end()
        }
        else if ($('#JenisDB').val() == 'MySQL') {
          var mysql = require('mysql')
          var con = mysql.createConnection({
            host: $('#Server').val(),
            user:$('#UsernameDB').val(),
            password: $('#PasswordDB').val(),
            database: $('#NamaDB').val()
          })
          con.connect(function(err) {
            if (err) {
              alert('Koneksi Gagal')
            } else {
              SimpanDB()
              alert('Koneksi Berhasil')
            }
          })
          con.end()
        }
        else if ($('#JenisDB').val() == 'SQLServer') {
          var sql = require('mssql')
          var Config = {
            server : $('#Server').val(),
            user: $('#UsernameDB').val(),
            password: $('#PasswordDB').val(),
            database: $('#NamaDB').val(),
            port: 1433,
            option: {
              encrypt: false
            }
          }
          var con = new sql.ConnectionPool(Config)
          con.connect(function (err){
            if (err) {
              alert('Koneksi Gagal')
            } else {
              SimpanDB()
              alert('Koneksi Berhasil')
            }
            con.close()
          })
        }
        else if ($('#JenisDB').val() == 'Oracle') {
          let connection;
          var oracledb = require('oracledb');
          try{
             connection = oracledb.getConnection({
              user : $('#UsernameDB').val(),
              password : $('#PasswordDB').val(),
              connectString : $('#Server').val()+'/'+$('#NamaDB').val()
             });
             SimpanDB()
             alert('Koneksi Berhasil')
          } catch(err) {
            console.log("Error: ", err);
            alert('Koneksi Gagal')
          } finally {
            if (connection) {
              try {
                connection.close();
              } catch(err) {
                console.log("Error when closing the database connection: ", err);
              }
            }
          }
        }
        else if ($('#JenisDB').val() == 'Firebird') {
          var Firebird = require('node-firebird');
          var options = {};
          options.host = $('#Server').val();
          options.port = 3050;
          options.database = $('#NamaDB').val();
          options.user = $('#UsernameDB').val();
          options.password = $('#PasswordDB').val();
          options.lowercase_keys = false; // set to true to lowercase keys
          options.role = null;            // default
          options.pageSize = 4096;        // default when creating database
          Firebird.attach(options, function(err,db) {
            if (err) {
              alert('Koneksi Gagal')
              db.detach()
            } else {
              SimpanDB()
              db.detach()
              alert('Koneksi Berhasil')
            }
          });
        }
        else if ($('#JenisDB').val() == 'DB2') {
          var ibmdb = require('ibm_db');
          ibmdb.open("DATABASE=<"+$('#NamaDB').val()+">;HOSTNAME=<"+$('#Server').val()+">;UID="+$('#UsernameDB').val()+";PWD="+$('#PasswordDB').val()+";PORT=<50000>;PROTOCOL=TCPIP", function (err,conn) {
            if (err) {
              alert('Koneksi Gagal')
            } else {
              SimpanDB()
              conn.close();
              alert('Koneksi Berhasil')
            }
          })
        }
      }
    }
});

function UploadDataDB() {
  if (store.get('JenisDB') == 'Postgre') {
    console.log('DB Postgre')
    DBUpload = schedule.scheduleJob('*/1 * * * *', function(){  
      if (parseInt(moment().format('HH')) >= store.get('JamBuka') && parseInt(moment().format('HH')) < store.get('JamTutup')) {
        const {Pool,Client} = require('pg')
        const connectionString = "postgressql://"+store.get('UsernameDB')+":"+store.get('PasswordDB')+"@"+store.get('ServerDB')+":5432/"+store.get('NamaDB');
        const client = new Client({
          connectionString:connectionString
        })
        client.connect()
        client.query(store.get('QueryDB'),(err,res) => {
          if (err) {
            alert("Query Postgre Penarikan Otomatis Error")
            DBUpload.cancel()
          } else {
            var DataWajibPajak = {}
            DataWajibPajak[store.get('NPWPD')] = JSON.parse(JSON.stringify(res.rows))
            $.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWajibPajak)).done(function(Respon) {
              if (Respon == 'ok') {
                console.log('Upload Data DB Postgre Otomatis, Sukses')
              } else {
                alert(Respon)
              }
            })
            client.end()
          }
        })
      }
    })
  }
  else if (store.get('JenisDB') == 'MySQL') {
    DBUpload = schedule.scheduleJob('*/1 * * * *', function(){
      if (parseInt(moment().format('HH')) >= store.get('JamBuka') && parseInt(moment().format('HH')) < store.get('JamTutup')) {
        var mysql = require('mysql')
        var con = mysql.createConnection({
          host: store.get('ServerDB'),
          user: store.get('UsernameDB'),
          password: store.get('PasswordDB'),
          database: store.get('NamaDB')
        })
        con.connect(function(err) {
          con.query(store.get('QueryDB'), function (err, result, fields) {
            if (err) {
              alert("Query MySQL Penarikan Otomatis Error")
              DBUpload.cancel()
            } else {
              var DataWajibPajak = {}
              DataWajibPajak[store.get('NPWPD')] = JSON.parse(JSON.stringify(result))
              $.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWajibPajak)).done(function(Respon) {
                if (Respon == 'ok') {
                  console.log('Upload Data DB MySQL Otomatis, Sukses')
                } else {
                  alert(Respon)
                }
              })
              con.end()
            }
          })
        })
      }
    })
  }
  else if (store.get('JenisDB') == 'SQLServer') {
    DBUpload = schedule.scheduleJob('*/1 * * * *', function(){
      if (parseInt(moment().format('HH')) >= store.get('JamBuka') && parseInt(moment().format('HH')) < store.get('JamTutup')) {
        var sql = require('mssql')
        var Config = {
          server : store.get('ServerDB'),
          user: store.get('UsernameDB'),
          password: store.get('PasswordDB'),
          database: store.get('NamaDB'),
          port: 1433,
          option: {
            encrypt: false
          }
        }

        var con = new sql.ConnectionPool(Config)
        con.connect(function (err){
          var req = new sql.Request(con);
          req.query(store.get('QueryDB'), function(err, result){
            if (err) {
              alert("Query SQLServer Penarikan Otomatis Error")
              DBUpload.cancel()
            } else {
              var DataWajibPajak = {}
              DataWajibPajak[store.get('NPWPD')] = JSON.parse(JSON.stringify(result.recordset))
              $.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWajibPajak)).done(function(Respon) {
                if (Respon == 'ok') {
                  console.log('Upload Data DB SQLServer Otomatis, Sukses')
                } else {
                  alert(Respon)
                }
              })
              con.close()  
            }
          })
        })
      }
    })
  }
  else if (store.get('JenisDB') == 'Oracle') {
    DBUpload = schedule.scheduleJob('*/1 * * * *', function(){
      if (parseInt(moment().format('HH')) >= store.get('JamBuka') && parseInt(moment().format('HH')) < store.get('JamTutup')) {
        let connection;
        var oracledb = require('oracledb');
        try{
           connection = oracledb.getConnection({
            user : store.get('UsernameDB'),
            password : store.get('PasswordDB'),
            connectString : store.get('ServerDB')+'/'+store.get('NamaDB')
           });
           connection.execute(store.get('QueryDB'),[],
            function(err, result) {
              if (err) {
                alert("Query Oracle Penarikan Otomatis Error")
                DBUpload.cancel()
                console.error(err.message);
                return;
              } else {
                console.log(result.rows);
              }
            }
           );
        } catch(err) {
          console.log("Error: ", err);
          alert('Koneksi Oracle Gagal')
        }
      }
    })
  }
  else if (store.get('JenisDB') == 'Firebird') {
    // /home/econk/Desktop/wp.fdb
    // SELECT * FROM Transaksi
    DBUpload = schedule.scheduleJob('*/1 * * * *', function(){
      if (parseInt(moment().format('HH')) >= store.get('JamBuka') && parseInt(moment().format('HH')) < store.get('JamTutup')) {
        var Firebird = require('node-firebird');
        var options = {};
         
        options.host = store.get('ServerDB');
        options.port = 3050;
        options.database = store.get('NamaDB');
        options.user = store.get('UsernameDB');
        options.password = store.get('PasswordDB');
        options.lowercase_keys = false; // set to true to lowercase keys
        options.role = null;            // default
        options.pageSize = 4096;        // default when creating database
        Firebird.attach(options, function(err, db) {
          db.query(store.get('QueryDB'), function(err, result) {
            if (err) {
              alert("Query Firebird Penarikan Otomatis Error")
              DBUpload.cancel()
            } else {
              Object.keys(result).forEach(function (item) {
                Object.keys(result[item]).forEach(function (key) {
                  result[item][key] = result[item][key].toString();
                });
              });
              var DataWajibPajak = {}
              DataWajibPajak[store.get('NPWPD')] = JSON.parse(JSON.stringify(result))
              $.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWajibPajak)).done(function(Respon) {
                if (Respon == 'ok') {
                  console.log('Upload Data DB Firebird Otomatis, Sukses')
                } else {
                  alert(Respon)
                }
              })
              db.detach();
            }
          });
        });
      }
    })
  }
  else if (store.get('JenisDB') == 'DB2') {
    DBUpload = schedule.scheduleJob('*/1 * * * *', function(){
      if (parseInt(moment().format('HH')) >= store.get('JamBuka') && parseInt(moment().format('HH')) < store.get('JamTutup')) {
        var ibmdb = require('ibm_db');
        ibmdb.open("DATABASE=<"+store.get('NamaDB')+">;HOSTNAME=<"+store.get('ServerDB')+">;UID="+store.get('UsernameDB')+";PWD="+store.get('PasswordDB')+";PORT=<50000>;PROTOCOL=TCPIP", function (err,conn) {
          conn.query(store.get('QueryDB'), function (err, data) {
            if (err) {
              alert("Query DB2 Penarikan Otomatis Error")
              DBUpload.cancel()
            } else {
              console.log(data)
              conn.close()
            }
          })
        })
      }
    })
  }
}

$('#UploadDbManual').on('click', () => {
  document.getElementById('Uploaddb').style.display = 'none'
  document.getElementById('DbUploadManual').style.display = 'block'
})

$('#KembaliDbManual').on('click', () => {
  document.getElementById('DbUploadManual').style.display = 'none'
  document.getElementById('Uploaddb').style.display = 'block'
})

$('#QueryDbManual').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
        event.preventDefault();
        document.getElementById("UploadDb").click();  
    }
});

$("#UploadDb").click(function(){
  if (store.get('JenisDB') == 'Postgre') {
    // select "NomorTransaksi","SubNominal","Service","Diskon","Pajak","TotalTransaksi","WaktuTransaksi" from "Transaksi"
    const {Pool,Client} = require('pg')
    const connectionString = "postgressql://"+store.get('UsernameDB')+":"+store.get('PasswordDB')+"@"+store.get('ServerDB')+":5432/"+store.get('NamaDB');
    const client = new Client({
      connectionString:connectionString
    })
    client.connect()
    client.query($('#QueryDbManual').val(),(err,res) => {
      if (err) {
        alert("Query Postgre Penarikan Manual Error")
      } else {
        var DataWajibPajak = {}
        DataWajibPajak[store.get('NPWPD')] = JSON.parse(JSON.stringify(res.rows))
        document.getElementById('DbData').value = JSON.stringify(res.rows)
        $.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWajibPajak)).done(function(Respon) {
          if (Respon == 'ok') {
            alert('Data Berhasil Di Upload')
          } else {
            alert('Data Gagal Di Upload')
          }
        })
        client.end()
      }
    })
  }
  else if (store.get('JenisDB') == 'MySQL') {
    // SELECT * FROM Transaksi
    var mysql = require('mysql')
    var con = mysql.createConnection({
      host: store.get('ServerDB'),
      user: store.get('UsernameDB'),
      password: store.get('PasswordDB'),
      database: store.get('NamaDB')
    })
    con.connect(function(err) {
      con.query($('#QueryDbManual').val(), function (err, result, fields) {
        if (err) {
          alert("Query MySQL Penarikan Manual Error")
        } else {
          var DataWajibPajak = {}
          DataWajibPajak[store.get('NPWPD')] = JSON.parse(JSON.stringify(result))
          document.getElementById('DbData').value = JSON.stringify(result)
          $.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWajibPajak)).done(function(Respon) {
            if (Respon == 'ok') {
              alert('Data Berhasil Di Upload')
            } else {
              alert('Data Gagal Di Upload')
            }
          })
          con.end()
        }
      })
    })
  }
  else if (store.get('JenisDB') == 'SQLServer') {
    // select * from Transaksi
    var sql = require('mssql')
    var Config = {
      server : store.get('ServerDB'),
      user: store.get('UsernameDB'),
      password: store.get('PasswordDB'),
      database: store.get('NamaDB'),
      port: 1433,
      option: {
        encrypt: false
      }
    }

    var con = new sql.ConnectionPool(Config)
    con.connect(function (err){
      var req = new sql.Request(con);
      req.query($('#QueryDbManual').val(), function(err, result){
        if (err) {
          alert("Query SQLServer Penarikan Manual Error")
        } else {
          var DataWajibPajak = {}
          DataWajibPajak[store.get('NPWPD')] = JSON.parse(JSON.stringify(result.recordset))
          document.getElementById('DbData').value = JSON.stringify(result.recordset)
          $.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWajibPajak)).done(function(Respon) {
            if (Respon == 'ok') {
              alert('Data Berhasil Di Upload')
            } else {
              alert('Data Gagal Di Upload')
            }
          })
          con.close()
        }
      })
    })
  }
  else if (store.get('JenisDB') == 'Oracle') {
    let connection;
    var oracledb = require('oracledb');
    try{
       connection = oracledb.getConnection({
        user : store.get('UsernameDB'),
        password : store.get('PasswordDB'),
        connectString : store.get('ServerDB')+'/'+store.get('NamaDB')
       });
       connection.execute($('#QueryDbManual').val(),[],
        function(err, result) {
          if (err) {
            alert("Query Oracle Penarikan Manual Error")
            console.error(err.message);
            return;
          } else {
            console.log(result.rows);
          }
        }
       );
    } catch(err) {
      console.log("Error: ", err);
      alert('Koneksi Oracle Gagal')
    }
  }
  else if (store.get('JenisDB') == 'Firebird') {
    // /home/econk/Desktop/wp.fdb
    // SELECT * FROM Transaksi
    var Firebird = require('node-firebird');
    var options = {};
     
    options.host = store.get('ServerDB');
    options.port = 3050;
    options.database = store.get('NamaDB');
    options.user = store.get('UsernameDB');
    options.password = store.get('PasswordDB');
    options.lowercase_keys = false; // set to true to lowercase keys
    options.role = null;            // default
    options.pageSize = 4096;        // default when creating database
    Firebird.attach(options, function(err, db) {
      db.query($('#QueryDbManual').val(), function(err, result) {
        if (err) {
          alert("Query Firebird Penarikan Manual Error")
        } else {
          Object.keys(result).forEach(function (item) {
            Object.keys(result[item]).forEach(function (key) {
              result[item][key] = result[item][key].toString();
            });
          });
          var DataWajibPajak = {}
          DataWajibPajak[store.get('NPWPD')] = JSON.parse(JSON.stringify(result))
          console.log(DataWajibPajak)
          document.getElementById('DbData').value = JSON.stringify(result)
          $.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWajibPajak)).done(function(Respon) {
            if (Respon == 'ok') {
              alert('Data Berhasil Di Upload')
            } else {
              alert('Data Gagal Di Upload')
            }
          })
          db.detach();
        }
      });
    });
  }
  else if (store.get('JenisDB') == 'DB2') {
    var ibmdb = require('ibm_db');
    ibmdb.open("DATABASE=<"+store.get('NamaDB')+">;HOSTNAME=<"+store.get('ServerDB')+">;UID="+store.get('UsernameDB')+";PWD="+store.get('PasswordDB')+";PORT=<50000>;PROTOCOL=TCPIP", function (err,conn) {
      conn.query($('#QueryDbManual').val(), function (err, data) {
        if (err) {
          alert("Query DB2 Penarikan Manual Error")
        } else {
          console.log(data)
          conn.close()
        }
      })
    })
  }
})

function GantiData(Sembunyi,Tampil) {
  document.getElementById(Sembunyi).style.display = 'none'
  document.getElementById(Tampil).style.display = 'block'
}

$('#KembaliText').on('click', () => {
  if (TextUpload != undefined) {
    TextUpload.cancel()
    console.log('TextUpload Cancelled')
  }
  GantiData('Uploadcsv','JenisData')
})

$('#KembaliApi').on('click', () => {
  if (ApiUpload != undefined) {
    ApiUpload.cancel()
    console.log('ApiUpload Cancelled')
  }
  GantiData('Uploadapi','JenisData')
})

$('#KembaliDB').on('click', () => {
  if (DBUpload != undefined) {
    DBUpload.cancel()
    console.log('DBUpload Cancelled')
  }
  GantiData('Uploaddb','JenisData')
})

function SignOut(Sembunyi,Tampil) {
  document.getElementById("NPWPD").value = ''
  document.getElementById("Password").value = ''
  document.getElementById(Sembunyi).style.display = 'none'
  document.getElementById(Tampil).style.display = 'block'
}

$('#LogOutText').on('click', () => {
  SignOut('Uploadcsv','Autentikasi')
})

$('#LogOutApi').on('click', () => {
  SignOut('Uploadapi','Autentikasi')
})

$('#LogOutDB').on('click', () => {
  SignOut('Uploaddb','Autentikasi')
})
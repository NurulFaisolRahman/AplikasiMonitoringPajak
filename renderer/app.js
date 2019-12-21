$ = require('jquery')
const moment = require('moment')
const CSVtoJSON = require('csvtojson')
const schedule = require('node-schedule')
const {ipcRenderer} = require('electron')

let time = moment()

window.addEventListener('offline', () => {
  alert('Internet Offline')
})

$("#FormLogin").submit(function(e) {
    e.preventDefault();
});
 
// schedule.scheduleJob('* */10 * * * *', function(){
//   var Data = { NPWPD: '1507.199.615', Sinyal: moment().format('YYYY-MM-DD HH:mm:ss') }
//   $.post(URL+"UpdateSinyal", Data)
//   console.log('suskes')
// });

var URL = 'http://localhost/MonitoringPajak/Autentikasi/'
// var URL = 'http://192.168.1.92/MonitoringPajak/Autentikasi/'

$('#Login').on('click', () => {
  if ($('#NPWPD').val() == '') {
    alert('Mohon Input NPWPD')
  } else if ($('#Password').val() == '') {
    alert('Mohon Input Password')
  } else {
    var iter = 0;
    var Akun = { NPWPD: $('#NPWPD').val(),Password: $('#Password').val() }
    $.ajax({
      type  : 'POST',
      url   : URL+'AutentikasiWajibPajak',
      data  : Akun,
      success : function(pesan){
        if (pesan == 'ok') {
          document.getElementById("Autentikasi").style.display = 'none'
          document.getElementById("JenisData").style.display = 'block'
          ipcRenderer.send('Sesi', $('#NPWPD').val())
        } else if(pesan == 'ko'){
          alert('NPWPD Tidak Terdaftar DiServer')
        } else if (pesan == 'fail') {
          alert('Password Salah')
        } else if (pesan == 'Disable') {
            alert('Akun Di Non Aktifkan Oleh Server')
        } else if (pesan == 'text') {
          document.getElementById("Autentikasi").style.display = 'none'
          document.getElementById("Uploadcsv").style.display = 'block'
        } else if (pesan == 'api') {
          document.getElementById("Autentikasi").style.display = 'none'
          document.getElementById("Uploadapi").style.display = 'block'
        } else if (pesan == 'db') {
          document.getElementById("Autentikasi").style.display = 'none'
          document.getElementById("Uploaddb").style.display = 'block'
        }
      }
    }).fail(function(e) {
      alert('Koneksi Gagal')
    });
  }
})

// CSVtoJSON({delimiter:'auto'}).fromFile('../WajibPajak/DataWP.csv').then(data => {
//   var DataWajibPajak = {}
//   DataWajibPajak[NPWPD] = data
//   $.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWajibPajak))
// })

$('#text').on('click', () => {
  var Data = { NPWPD: $('#NPWPD').val(), JenisData: 'text' }
  $.post(URL+"UpdateJenisData", Data)
  document.getElementById("JenisData").style.display = 'none'
  document.getElementById("Uploadcsv").style.display = 'block'
})

$('#api').on('click', () => {
  var Data = { NPWPD: $('#NPWPD').val(), JenisData: 'api' }
  $.post(URL+"UpdateJenisData", Data)
  document.getElementById("JenisData").style.display = 'none'
  document.getElementById("Uploadapi").style.display = 'block'
})

$('#db').on('click', () => {
  var Data = { NPWPD: $('#NPWPD').val(), JenisData: 'db' }
  $.post(URL+"UpdateJenisData", Data)
  document.getElementById("JenisData").style.display = 'none'
  document.getElementById("Uploaddb").style.display = 'block'
})

$('#KembaliText').on('click', () => {
  document.getElementById("Uploadcsv").style.display = 'none'
  document.getElementById("JenisData").style.display = 'block'
})

$('#KembaliApi').on('click', () => {
  document.getElementById("Uploadapi").style.display = 'none'
  document.getElementById("JenisData").style.display = 'block'
})

$('#KembaliDB').on('click', () => {
  document.getElementById("Uploaddb").style.display = 'none'
  document.getElementById("JenisData").style.display = 'block'
})

$('#LogOutText').on('click', () => {
  document.getElementById("NPWPD").value = ''
  document.getElementById("Password").value = ''
  document.getElementById("Uploadcsv").style.display = 'none'
  document.getElementById("Autentikasi").style.display = 'block'
})

$('#LogOutApi').on('click', () => {
  document.getElementById("NPWPD").value = ''
  document.getElementById("Password").value = ''
  document.getElementById("Uploadapi").style.display = 'none'
  document.getElementById("Autentikasi").style.display = 'block'
})

$('#LogOutDB').on('click', () => {
  document.getElementById("NPWPD").value = ''
  document.getElementById("Password").value = ''
  document.getElementById("Uploaddb").style.display = 'none'
  document.getElementById("Autentikasi").style.display = 'block'
})

$("#UploadText").click(function(){
 	var fileUpload = document.getElementById("DataCSV")
 	var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
 	if (regex.test(fileUpload.value.toLowerCase())) {
 		if (typeof (FileReader) != "undefined") {
 			var reader = new FileReader();
 			reader.onload = function (e) {
 				var lines = e.target.result.split('\r');
 				for (let i = 0; i < lines.length; i++) {
 					lines[i] = lines[i].replace(/\s/, '') //delete all blanks
 				}
        var DataWajibPajak = {};
 				var InputData = [];
 				var headers = lines[0].split(";");
 				for (var i = 1; i < lines.length-1; i++) {
 					var obj = {};
 					var currentline = lines[i].split(";");
 					for (var j = 0; j < headers.length; j++) {
 						obj[headers[j]] = currentline[j];
 					}
 					InputData.push(obj);
 				}
        DataWajibPajak[$('#NPWPD').val()] = InputData;
        $.ajax({
          type	: 'POST',
      		url		: 'http://localhost/MonitoringPajak/Autentikasi/InputTransaksiWajibPajak',
          data  : JSON.stringify(DataWajibPajak),
          contentType: 'application/json',
      		success	: function(pesan){
            if (pesan == 'ok') {
              alert('Sukses')
              document.getElementById('DataCSV').value = ""
            } else {
              alert(pesan)
            }
      		}
      	}).fail(function(e) {
          alert(e);
        });
 			}
 			reader.readAsText(fileUpload.files[0]);
 		}
 	}
  else {
    alert('Mohon Input Data CSV/TXT')
    document.getElementById('DataCSV').value = ""
 	}
})

// $("#UploadApi").click(function(){
//   if ($('#URLapi').val() == '') {
//     document.getElementById("IsiPesan").innerHTML = 'Mohon Input URL'
//     document.getElementById("Pesan").style.display = 'block'
//   } else {
//     $.ajax({
//       type	: 'POST',
//       url		: $('#URLapi').val(),
//       success	: function(Respon){
//         $.ajax({
//           type	: 'POST',
//       		url		: 'http://localhost/MonitoringPajak/Autentikasi/InputTransaksiWajibPajak',
//           data  : Respon,
//           contentType: 'application/json',
//       		success	: function(pesan){
//             if (pesan == 'ok') {
//               document.getElementById("IsiPesan").innerHTML = 'Sukses'
//               document.getElementById("Pesan").style.display = 'block'
//             } else {
//               alert(pesan)
//               document.getElementById("IsiPesan").innerHTML = 'Gagal'
//               document.getElementById("Pesan").style.display = 'block'
//             }
//       		}
//       	}).fail(function(e) {
//           console.log(e);
//           document.getElementById("IsiPesan").innerHTML = 'Koneksi Gagal'
//           document.getElementById("Pesan").style.display = 'block'
//         });
//       }
//     }).fail(function() {
//       document.getElementById("IsiPesan").innerHTML = 'URL Tidak Valid'
//       document.getElementById("Pesan").style.display = 'block'
//     })
//   }
// });

// $("#UploadDb").click(function(){
//   if ($('#Querydb').val() == '') {
//     document.getElementById("IsiPesan").innerHTML = 'Mohon Input Query'
//     document.getElementById("Pesan").style.display = 'block'
//   } else {
//     const {Pool,Client} = require('pg')
//     const connectionString = "postgressql://econk:iyonk@localhost:5432/econk";
//     const client = new Client({
//       connectionString:connectionString
//     })
//     client.connect()
//     client.query('select * from '+'"Transaksi"',(err,res) => {
//       console.log(JSON.stringify(res.rows))
//       $.ajax({
//         type	: 'POST',
//         url		: $('#URLapi').val(),
//         success	: function(Respon){
//           $.ajax({
//             type	: 'POST',
//         		url		: 'http://localhost/MonitoringPajak/Autentikasi/InputTransaksiWajibPajak',
//             data  : JSON.stringify(res.rows),
//             contentType: 'application/json',
//         		success	: function(pesan){
//               if (pesan == 'ok') {
//                 document.getElementById("IsiPesan").innerHTML = 'Sukses'
//                 document.getElementById("Pesan").style.display = 'block'
//               } else {
//                 alert(pesan)
//                 document.getElementById("IsiPesan").innerHTML = 'Gagal'
//                 document.getElementById("Pesan").style.display = 'block'
//               }
//         		}
//         	}).fail(function(e) {
//             console.log(e);
//             document.getElementById("IsiPesan").innerHTML = 'Koneksi Gagal'
//             document.getElementById("Pesan").style.display = 'block'
//           });
//         }
//       }).fail(function() {
//         document.getElementById("IsiPesan").innerHTML = 'Query Tidak Valid'
//         document.getElementById("Pesan").style.display = 'block'
//       })
//       client.end()
//     })
//   }
// });

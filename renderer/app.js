if (!navigator.onLine) {
  document.getElementById("IsiPesan").innerHTML = 'Koneksi Gagal'
  document.getElementById("Pesan").style.display = 'block';
}
window.addEventListener('online', () => {
  document.getElementById("Pesan").style.display = 'none';
})
window.addEventListener('offline', () => {
  document.getElementById("IsiPesan").innerHTML = 'Koneksi Gagal'
  document.getElementById("Pesan").style.display = 'block';
})

$ = require('jquery');

var input = document.getElementById("NPWPD");
input.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("Login").click();
  }
});

$('#Login').on('click', () => {
    if (!navigator.onLine) {
      document.getElementById("IsiPesan").innerHTML = 'Koneksi Gagal'
      document.getElementById("Pesan").style.display = 'block';
    } else {
      if ($('#NPWPD').val() == '') {
        document.getElementById("IsiPesan").innerHTML = 'Mohon Input NPWPD'
        document.getElementById("Pesan").style.display = 'block';
      } else {
        var NPWPD = { NPWPD: $('#NPWPD').val() };
      	$.ajax({
          type	: 'POST',
      		url		: 'http://localhost/MonitoringPajak/Autentikasi/AutentikasiWajibPajak',
      		data	: NPWPD,
      		success	: function(pesan){
            if (pesan == 'ok') {
              document.getElementById("Pesan").style.display = 'block';
              document.getElementById("IsiPesan").innerHTML = 'Pilih Jenis Data'
              document.getElementById("Autentikasi").style.display = 'none';
              document.getElementById("JenisData").style.display = 'block';
            } else {
              if (pesan == 'Disable') {
                document.getElementById("IsiPesan").innerHTML = 'Akun Di Non Aktifkan Oleh Server'
                document.getElementById("Pesan").style.display = 'block';
              } else {
                document.getElementById("IsiPesan").innerHTML = 'NPWPD Tidak Terdaftar DiServer!'
                document.getElementById("Pesan").style.display = 'block';
              }
            }
      		}
      	}).fail(function() {
          document.getElementById("IsiPesan").innerHTML = 'Koneksi Gagal!'
          document.getElementById("Pesan").style.display = 'block';
        });
      }
    }
})

$('#text').on('click', () => {
  document.getElementById("JenisData").style.display = 'none';
  document.getElementById("Pesan").style.display = 'none';
  document.getElementById("Uploadcsv").style.display = 'block';
})

$('#api').on('click', () => {
  document.getElementById("JenisData").style.display = 'none';
  document.getElementById("Pesan").style.display = 'none';
  document.getElementById("Uploadapi").style.display = 'block';
})

$('#db').on('click', () => {
  document.getElementById("JenisData").style.display = 'none';
  document.getElementById("Pesan").style.display = 'none';
  document.getElementById("Uploaddb").style.display = 'block';
})

$("#FormLogin").submit(function(e) {
    e.preventDefault();
});

$("#Tutup").click(function(){
 document.getElementById("Pesan").style.display = 'none';
});

$("#UploadText").click(function(){
 	var fileUpload = document.getElementById("DataCSV");
 	var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
 	if (regex.test(fileUpload.value.toLowerCase())) {
 		if (typeof (FileReader) != "undefined") {
 			var reader = new FileReader();
 			reader.onload = function (e) {
 				var lines = e.target.result.split('\r');
 				for (let i = 0; i < lines.length; i++) {
 					lines[i] = lines[i].replace(/\s/, '') //delete all blanks
 				}
 				var result = [];
 				var headers = lines[0].split(";");
 				for (var i = 1; i < lines.length-1; i++) {
 					var obj = {};
 					var currentline = lines[i].split(";");
 					for (var j = 0; j < headers.length; j++) {
 						obj[headers[j]] = currentline[j];
 					}
 					result.push(obj);
 				}
        $.ajax({
          type	: 'POST',
      		url		: 'http://localhost/MonitoringPajak/Autentikasi/InputTransaksiWajibPajak',
          data  : JSON.stringify(result),
          contentType: 'application/json',
      		success	: function(pesan){
            if (pesan == 'ok') {
              document.getElementById("IsiPesan").innerHTML = 'Sukses'
              document.getElementById("Pesan").style.display = 'block';
            } else {
              alert(pesan)
              document.getElementById("IsiPesan").innerHTML = 'Gagal'
              document.getElementById("Pesan").style.display = 'block';
            }
      		}
      	}).fail(function(e) {
          console.log(e);
          document.getElementById("IsiPesan").innerHTML = 'Koneksi Gagal'
          document.getElementById("Pesan").style.display = 'block';
        });
 			}
 			reader.readAsText(fileUpload.files[0]);
 		}
    else {
      document.getElementById("IsiPesan").innerHTML = 'Browser Tidak Support HTML5'
      document.getElementById("Pesan").style.display = 'block';
 		}
 	}
  else {
    document.getElementById("IsiPesan").innerHTML = 'Mohon Input Data CSV!'
    document.getElementById("Pesan").style.display = 'block';
 	}
});

$("#UploadApi").click(function(){
  if ($('#URLapi').val() == '') {
    document.getElementById("IsiPesan").innerHTML = 'Mohon Input URL'
    document.getElementById("Pesan").style.display = 'block';
  } else {
    $.ajax({
      type	: 'POST',
      url		: $('#URLapi').val(),
      success	: function(Respon){
        $.ajax({
          type	: 'POST',
      		url		: 'http://localhost/MonitoringPajak/Autentikasi/InputTransaksiWajibPajak',
          data  : Respon,
          contentType: 'application/json',
      		success	: function(pesan){
            if (pesan == 'ok') {
              document.getElementById("IsiPesan").innerHTML = 'Sukses'
              document.getElementById("Pesan").style.display = 'block';
            } else {
              alert(pesan)
              document.getElementById("IsiPesan").innerHTML = 'Gagal'
              document.getElementById("Pesan").style.display = 'block';
            }
      		}
      	}).fail(function(e) {
          console.log(e);
          document.getElementById("IsiPesan").innerHTML = 'Koneksi Gagal'
          document.getElementById("Pesan").style.display = 'block';
        });
      }
    }).fail(function() {
      document.getElementById("IsiPesan").innerHTML = 'URL Tidak Valid'
      document.getElementById("Pesan").style.display = 'block';;
    })
  }
});

$("#UploadDb").click(function(){
  if ($('#Querydb').val() == '') {
    document.getElementById("IsiPesan").innerHTML = 'Mohon Input Query'
    document.getElementById("Pesan").style.display = 'block';
  } else {
    const {Pool,Client} = require('pg')
    const connectionString = "postgressql://econk:iyonk@localhost:5432/econk";
    const client = new Client({
      connectionString:connectionString
    })
    client.connect()
    client.query('select * from '+'"Transaksi"',(err,res) => {
      console.log(JSON.stringify(res.rows))
      $.ajax({
        type	: 'POST',
        url		: $('#URLapi').val(),
        success	: function(Respon){
          $.ajax({
            type	: 'POST',
        		url		: 'http://localhost/MonitoringPajak/Autentikasi/InputTransaksiWajibPajak',
            data  : JSON.stringify(res.rows),
            contentType: 'application/json',
        		success	: function(pesan){
              if (pesan == 'ok') {
                document.getElementById("IsiPesan").innerHTML = 'Sukses'
                document.getElementById("Pesan").style.display = 'block';
              } else {
                alert(pesan)
                document.getElementById("IsiPesan").innerHTML = 'Gagal'
                document.getElementById("Pesan").style.display = 'block';
              }
        		}
        	}).fail(function(e) {
            console.log(e);
            document.getElementById("IsiPesan").innerHTML = 'Koneksi Gagal'
            document.getElementById("Pesan").style.display = 'block';
          });
        }
      }).fail(function() {
        document.getElementById("IsiPesan").innerHTML = 'Query Tidak Valid'
        document.getElementById("Pesan").style.display = 'block';;
      })
      client.end()
    })
  }
});

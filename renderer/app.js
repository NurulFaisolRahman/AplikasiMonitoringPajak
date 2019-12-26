$ = require('jquery')
const moment = require('moment')
const CSVtoJSON = require('csvtojson')
const schedule = require('node-schedule')
const Store = require('./store.js')

var SinyalOnline
var TextUpload

const store = new Store({
  configName: 'Sesi',
  defaults: {}
})

let time = moment()

window.addEventListener('offline', () => {
  if (SinyalOnline != undefined) {
    SinyalOnline.cancel()
  }
  document.getElementById("Alert").style.display = 'block'
  console.log('stop')
})

function KirimSinyalOnline() {
  SinyalOnline = schedule.scheduleJob('*/1 * * * *', function(){
    if (parseInt(moment().format('HH')) >= store.get('JamBuka') && parseInt(moment().format('HH')) < store.get('JamTutup')) {
      var Data = { NPWPD: store.get('NPWPD'), Sinyal: moment().format('YYYY-MM-DD HH:mm:ss') }
      $.post(URL+"UpdateSinyal", Data)
      console.log('sukses')
    }
  })
}
window.addEventListener('online', () => {
  document.getElementById("Alert").style.display = 'none'
  console.log('start')
})

var URL = 'http://localhost/MonitoringPajak/Autentikasi/'
// var URL = 'http://192.168.1.92/MonitoringPajak/Autentikasi/'

function Jadwal() {
  KirimSinyalOnline()
  var Buka = schedule.scheduleJob('0 0 '+store.get('JamBuka')+' * * *', function(){
      KirimSinyalOnline()
      console.log('BUKA')
  })
  var Tutup = schedule.scheduleJob('0 0 '+store.get('JamTutup')+' * * *', function(){
      SinyalOnline.cancel()
      console.log('TUTUP')
  })
}


if (store.get('NPWPD') != undefined) {
  Jadwal()
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
    $.ajax({
      type  : 'POST',
      url   : URL+'AutentikasiWajibPajak',
      data  : Akun,
      success : function(pesan){
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
            store.set('JamKirim', parseInt(parseInt(Pecah2[0])+ ((parseInt(Pecah3[0]) - parseInt(Pecah2[0]))/2)))
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
          document.getElementById("Autentikasi").style.display = 'none'
          document.getElementById("Uploaddb").style.display = 'block'
        }
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

$('#text').on('click', () => {
  SetJenisData('JenisData','Uploadcsv','text')
  Jadwal()
  UploadDataText()
})

$('#api').on('click', () => {
  SetJenisData('JenisData','Uploadapi','api')
  Jadwal()
})

$('#db').on('click', () => {
  SetJenisData('JenisData','Uploaddb','db')
  Jadwal()
})

function GantiData(Sembunyi,Tampil) {
  document.getElementById(Sembunyi).style.display = 'none'
  document.getElementById(Tampil).style.display = 'block'
}

$('#KembaliText').on('click', () => {
  GantiData('Uploadcsv','JenisData')
})

$('#KembaliApi').on('click', () => {
  GantiData('Uploadapi','JenisData')
})

$('#KembaliDB').on('click', () => {
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

if (store.get('JenisText') != undefined) {
  UploadDataText()
}

function UploadDataText() {
  store.set('JenisText', $('#JenisText').val())
  store.set('IndexText', $("#JenisText")[0].selectedIndex)
  TextUpload = schedule.scheduleJob('0 0 '+store.get('JamKirim')+' * * *', function(){
    CSVtoJSON({delimiter:'auto'}).fromFile('../WajibPajak/data.csv').then(data => {
      var DataWajibPajak = {}
      DataWajibPajak[store.get('NPWPD')] = data
      console.log(JSON.stringify(DataWajibPajak))
      $.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWajibPajak))
      console.log('TextSukses')
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
      DataWajibPajak[store.get('NPWPD')] = data
      console.log(JSON.stringify(DataWajibPajak))
      document.getElementById('TextData').value = JSON.stringify(data)
      $.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWajibPajak))
      alert('Data Berhasil Di Upload')
      document.getElementById('DataCSV').value = ''
    })
  }
  else {
    alert('Mohon Input Data CSV/TXT!')
    document.getElementById('DataCSV').value = ''
  }
})

var ApiUpload
var AlamatApi
if (store.get('ApiURL') != undefined) {
  AlamatApi = store.get('ApiURL')
}
var UrlApi = document.getElementById('URLapi')
UrlApi.addEventListener('change', OnUrlApiChange)

function OnUrlApiChange(event) {
    AlamatApi = event.target.value
    console.log(AlamatApi)
    UploadDataApi()
}

if (store.get('ApiURL') != undefined) {
  // UploadDataApi()
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
  $.post(AlamatApi).done(function(Respon) {
    if (IsJson(Respon)){
      store.set('ApiURL', AlamatApi)
      ApiUpload = schedule.scheduleJob('*/15 * * * * *', function(){
        var DataWajibPajak = {}
        DataWajibPajak[store.get('NPWPD')] = JSON.parse(Respon)
        console.log(JSON.stringify(DataWajibPajak))
        $.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWajibPajak))
        console.log('ApiSukses')
      })
    }
    else {
      alert('Respon Data Bukan JSON!')
    }
  }).fail(function() {
    alert('URL Tidak Valid!')
  })
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
});

// http://localhost/MonitoringPajak/Autentikasi/

$("#UploadApi").click(function(){
    $.post($('#URLapiManual').val()).done(function(Respon) {
    if (IsJson(Respon)){
      var DataWajibPajak = {}
      DataWajibPajak[store.get('NPWPD')] = JSON.parse(Respon)
      console.log(JSON.stringify(DataWajibPajak))
      $.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWajibPajak))
      alert('Data Berhasil Di Upload')
      document.getElementById('ApiData').value = Respon
    }
    else {
      alert('Respon Data Bukan JSON!')
    }
  }).fail(function() {
    alert('URL Tidak Valid!')
  })
})

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

// select "NomorTransaksi","SubNominal","Service","Diskon","Pajak","TotalTransaksi","WaktuTransaksi" from "Transaksi"

$("#UploadDb").click(function(){
  if ($('#QueryDbManual').val() == '') {
    alert('Mohon Input Query!')
  } else {
    const {Pool,Client} = require('pg')
    const connectionString = "postgressql://econk:iyonk@localhost:5432/econk";
    const client = new Client({
      connectionString:connectionString
    })
    client.connect()
    client.query($('#QueryDbManual').val(),(err,res) => {
      var DataWajibPajak = {}
      DataWajibPajak[store.get('NPWPD')] = JSON.parse(JSON.stringify(res.rows))
      console.log(JSON.stringify(DataWajibPajak))
      document.getElementById('DbData').value = JSON.stringify(res.rows)
      $.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWajibPajak))
      alert('Data Berhasil Di Upload')
      client.end()
    })
  }
})

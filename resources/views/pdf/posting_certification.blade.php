<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    {{-- <link href="//cdn.muicss.com/mui-0.10.1/css/mui.min.css" rel="stylesheet" type="text/css" /> --}}
    <!-- <link rel="stylesheet" href="https://unpkg.com/purecss@1.0.1/build/pure-min.css" integrity="sha384-oAOxQR6DkCoMliIh8yFnu25d7Eq/PHS21PClpwjOTeU2jRSq11vu66rf90/cZr47" crossorigin="anonymous"> -->
    <!-- CSS only -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    {{-- <link rel="stylesheet" href="{{ url('css').'/bootstrap.min.css' }}"> --}}
    {{-- <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"> --}}
    <title>Document</title>
    <style>
        body{
            font-family: Tahoma
        }
        td, th {
            text-align: left;
        }
        #customers th {
            background-color: #053742;
            color: white;
        }
        p{
            margin-top: -7px;
            padding-top: 0px;
            padding-bottom: 0px;
            margin-bottom: -7px;
            font-family: Tahoma, Verdana, sans-serif;
        }
        .logo-cell{
            width: 110px;
            align-self: center;
        }
        .cert-title{
            margin-top: 80px;
            font-family: Tahoma, Verdana, sans-serif;
        }
        .content-one{
            margin-top: 80px;
        }
        .content-two{
            margin-top: 20px;
        }
        .content{
            margin-left: 50px;
            text-align: justify;
        }
    </style>
</head>
<body>

    <table style="margin-left: 30px; margin-top:40px">
      <tr>
        <td class="logo-cell">
            <div class="text-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Department_of_Public_Works_and_Highways_%28DPWH%29.svg/240px-Department_of_Public_Works_and_Highways_%28DPWH%29.svg.png" width="90" />
            </div>
        </td>
        <td>
            <!-- Header -->
            <div class="text-center">
                <p><small>Republic of the Philippines</small></p>
                <p style="font-size: 12;">DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS</p>
                <p style="font-size: 11;"><b>SORSOGON SECOND DISTRICT ENGINEERING OFFICE</b></p>
                <p style="font-size: 10;"><small>Payawin, Gubat, Sorsogon Region V</small></p>
            </div>
        </td>
        <td class="logo-cell">
            <div class="text-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Bagong_Pilipinas_logo.png" width="105" style="margin-top: 0;" />
            </div>
        </td>
      </tr>
    </table>

    <h1 class="text-center cert-title">CERTIFICATION</h1>

    <p class="content content-one">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This is to certify that the <b>INVITATION TO BID</b> for the
        {{ $title }} with <b>Contract ID: {{ $contract_id }}</b> was posted in three (3) conspicuous places/ Bulletin Boards
     of this office from {{ \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $bulletin_posting.' 00:00:00')->format('F d, Y') }} to
     {{ \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $bulletin_removal.' 00:00:00')->format('F d, Y') }}. </p>
     <p class="content content-two">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Issued this {{ \Carbon\Carbon::now()->format('l jS \\of F Y') }}
        at the DPWH Sorsogon 2nd District Engineering Office, Payawin, Gubat, Sorsogon. </p>

    <table style="margin-top: 100px">
        <tr>
            <td style="width: 280;">
                <!-- <h1>Hello</h1> -->
            </td>
            <td style="width: 200;">
                <div class="text-center">
                    <!-- This should be base from the fetch data from API -->
                    <hr style="margin-bottom: 0px;"/>
                    <!-- <p style="margin-top:0px; font-size: 12"><b>Levi D. Pura, Jr.</b></p>
                    <p style="color: #333"><small>Administrative Officer V / PIO Designate</small></p> -->
                    <p style="margin-top:0px; font-size: 12"><b>Kenneth G. Rabulan</b></p>
                    <p style="color: #333"><small>Alternate PIO - Designate</small></p>
                </div>
            </td>
        </tr>
    </table>

</body>
</html>

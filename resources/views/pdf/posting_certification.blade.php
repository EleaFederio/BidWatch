<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">

    <title>Certification</title>
    <style>
        body {
            font-family: Tahoma, Verdana, sans-serif;
            color: #1a1a1a;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .header-table td {
            vertical-align: middle;
            text-align: center;
            padding: 0;
        }

        .logo-cell {
            width: 110px;
            text-align: center;
            vertical-align: middle;
        }

        .header-logo {
            width: 90px;
            max-width: 90px;
            display: inline-block;
            margin: 0 auto;
        }

        .header-organization {
            text-align: center;
            line-height: 1.15;
            font-size: 11px;
            padding: 0 10px;
        }

        .cert-title {
            margin-top: 20px;
            font-family: Tahoma, Verdana, sans-serif;
            font-size: 34px;
            font-weight: 700;
            letter-spacing: 1px;
        }

        p {
            margin: 0;
            padding: 0;
            font-size: 12px;
            line-height: 1.7;
        }

        .content {
            margin-top: 30px;
            margin-left: 35px;
            margin-right: 35px;
            text-align: justify;
        }

        .content-two {
            margin-top: 20px;
        }

        .signature-row {
            margin-top: 120px;
        }

        .signature-cell {
            width: 240px;
            text-align: center;
        }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td class="logo-cell">
                <img class="header-logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Department_of_Public_Works_and_Highways_%28DPWH%29.svg/240px-Department_of_Public_Works_and_Highways_%28DPWH%29.svg.png" alt="DPWH Logo">
            </td>
            <td class="header-organization">
                <p>Republic of the Philippines</p>
                <p><strong>DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS</strong></p>
                <p><strong>SORSOGON SECOND DISTRICT ENGINEERING OFFICE</strong></p>
                <p><small>Payawin, Gubat, Sorsogon Region V</small></p>
            </td>
            <td class="logo-cell">
                <img class="header-logo" src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Bagong_Pilipinas_logo.png" alt="Bagong Pilipinas Logo">
            </td>
        </tr>
    </table>

    <h1 class="cert-title">CERTIFICATION</h1>

    <div class="content">
        <p>This is to certify that the <strong>INVITATION TO BID</strong> for <strong>{{ $title }}</strong> with <strong>Contract ID: {{ $contract_id }}</strong> was posted in three (3) conspicuous places/bulletin boards of this office from <strong>{{ \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $bulletin_posting.' 00:00:00')->format('F d, Y') }}</strong> to <strong>{{ \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $bulletin_removal.' 00:00:00')->format('F d, Y') }}</strong>.</p>
        <p class="content-two">Issued this <strong>{{ \Carbon\Carbon::now()->format('l jS \\of F Y') }}</strong> at the DPWH Sorsogon 2nd District Engineering Office, Payawin, Gubat, Sorsogon.</p>
    </div>

    <div class="signature-row">
        <div class="signature-cell">
            <hr style="margin-bottom: 4px; border: 1px solid #000;" />
            <p><strong>Levi D. Pura, Jr.</strong></p>
            <p style="font-size: 12px;">Administrative Officer V / PIO Designate</p>
        </div>
    </div>

</body>
</html>

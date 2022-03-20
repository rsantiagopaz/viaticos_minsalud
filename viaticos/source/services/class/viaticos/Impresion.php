<?php
session_start();

set_time_limit(0);

require('conexion.php');

$mysqli = new mysqli("$servidor", "$usuario", "$password", "$base");
$mysqli->query("SET NAMES 'utf8'");


switch ($_REQUEST['rutina']) {
case 'imprimir_total_motivos': {
	
$sql = "SELECT * FROM motivo ORDER BY descrip";
$rsMotivo = $mysqli->query($sql);

	?>
	<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
		<title>Total por motivos</title>
	</head>
	<body>
	<table border="0" cellpadding=0 cellspacing=0 width=750 height=1% align="center">
	<tr><td align="center" colspan="6"><big>TOTAL POR MOTIVOS	<?php echo $_REQUEST['desde'] . " - " . $_REQUEST['hasta']  ?></big></td></tr>
	<tr><td>&nbsp;</td></tr>
	<?php
	while ($rowMotivo = $rsMotivo->fetch_object()) {
		$sql = "SELECT COUNT(id_viatico) AS cantidad, SUM(subtotal_viatico2) AS subtotal_viatico2, SUM(pasajes2) AS pasajes2, SUM(combustible2) AS combustible2, SUM(subtotal_alojam2) AS subtotal_alojam2, SUM(otros_gastos2) AS otros_gastos2, id_motivo FROM viatico WHERE estado <> 'A' AND id_motivo='" . $rowMotivo->id_motivo . "' AND (fecha_desde2 BETWEEN '" . $_REQUEST['desde'] . "' AND '" . $_REQUEST['hasta'] . "') GROUP BY id_motivo";
		$rsViatico = $mysqli->query($sql);
		$rowViatico = $rsViatico->fetch_object();
	?>
	<tr><td><big><?php echo $rowMotivo->descrip ?></big></td></tr>
	<tr><td>Cantidad viaticos: <?php echo $rowViatico->cantidad ?></td><td align="right">TOTAL: <?php echo "$ " . number_format((float) $rowViatico->subtotal_viatico2 + (float) $rowViatico->pasajes2 + (float) $rowViatico->combustible2 + (float) $rowViatico->subtotal_alojam2 + (float) $rowViatico->otros_gastos2, 2) ?></td></tr>
	<tr><td>&nbsp;</td></tr>
	<?php
	}
	?>
	</table>
	</body>
	</html>
	<?php
		
break;
}


case 'imprimir_total_dependencia': {

$sql = "SELECT COUNT(id_viatico) AS cantidad, SUM(subtotal_viatico2) AS subtotal_viatico2, SUM(pasajes2) AS pasajes2, SUM(combustible2) AS combustible2, SUM(subtotal_alojam2) AS subtotal_alojam2, SUM(otros_gastos2) AS otros_gastos2, TRUE as grupo FROM viatico WHERE estado <> 'A' AND organismo_area_id_origen='" . $_REQUEST['organismo_area_id'] . "' AND (fecha_desde2 BETWEEN '" . $_REQUEST['desde'] . "' AND '" . $_REQUEST['hasta'] . "') GROUP BY grupo";
$rsViatico = $mysqli->query($sql);
$rowViatico = $rsViatico->fetch_object();

$sql = "SELECT CONCAT(organismo_area, ' (', organismo, ')') AS label, organismo_area_id AS model FROM salud1._organismos_areas INNER JOIN salud1._organismos USING(organismo_id) WHERE organismo_area_id='" . $_REQUEST['organismo_area_id'] . "'";
$rsOrganismo = $mysqli->query($sql);
$rowOrganismo = $rsOrganismo->fetch_object();

	?>
	<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
		<title>Total por dependencia</title>
	</head>
	<body>
	<table border="0" cellpadding=0 cellspacing=0 width=750 height=1% align="center">
	<tr><td align="center" colspan="6"><big>TOTAL POR DEPENDENCIA	<?php echo $_REQUEST['desde'] . " - " . $_REQUEST['hasta']  ?></big></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td><big>Datos</big></td></tr>
	<tr><td colspan="6">Dependencia: <?php echo $rowOrganismo->label ?></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td>Cantidad viaticos: <?php echo $rowViatico->cantidad ?></td><td align="right">TOTAL: <?php echo "$ " . number_format((float) $rowViatico->subtotal_viatico2 + (float) $rowViatico->pasajes2 + (float) $rowViatico->combustible2 + (float) $rowViatico->subtotal_alojam2 + (float) $rowViatico->otros_gastos2, 2) ?></td></tr>
	</table>
	</body>
	</html>
	<?php
		
break;
}


case 'imprimir_historial_empleado': {

$sql = "SELECT viatico.*, motivo.descrip FROM (viatico INNER JOIN motivo USING(id_motivo)) WHERE viatico.estado <> 'A' AND id_personal='" . $_REQUEST['id_personal'] . "' AND (fecha_desde2 BETWEEN '" . $_REQUEST['desde'] . "' AND '" . $_REQUEST['hasta'] . "') ORDER BY fecha_desde2, hora_desde2";
$rsViatico = $mysqli->query($sql);

$sql = "SELECT _personal.apenom, _personal.dni FROM salud1._personal WHERE id_personal='" . $_REQUEST['id_personal'] . "'";
$rsPersonal = $mysqli->query($sql);
$rowPersonal = $rsPersonal->fetch_object();

	$meses = array();
	$meses["01"] = "Enero";
	$meses["02"] = "Febrero";
	$meses["03"] = "Marzo";
	$meses["04"] = "Abril";
	$meses["05"] = "Mayo";
	$meses["06"] = "Junio";
	$meses["07"] = "Julio";
	$meses["08"] = "Agosto";
	$meses["09"] = "Septiembre";
	$meses["10"] = "Octubre";
	$meses["11"] = "Noviembre";
	$meses["12"] = "Diciembre";

	?>
	<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
		<title>Historial de empleado</title>
	</head>
	<body>
	<input type="submit" value="Imprimir" onClick="window.print();"/>
	<table border="0" width="750" align="center">
	<tr><td colspan="6"><IMG SRC="../../../resource/viaticos/logo.png" width="70" height="75""></td></tr>
	<tr><td align="center" colspan="6"><big>REGISTRO UNICO DE VIATICOS</big></td></tr>
	<tr><td align="center" colspan="6"><big>Historial de empleado (<?php echo $_REQUEST['desde'] . " - " . $_REQUEST['hasta'] ?>)</big></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td><big>Datos de la persona</big></td></tr>
	<tr><td colspan="2">Ape. y nom.: <?php echo trim($rowPersonal->apenom) ?></td><td>Nro.doc.: <?php echo $rowPersonal->dni ?></td></tr>
	<?php
	$viaticos = 0;
	$pasajes = 0;
	$combustible = 0;
	$alojam = 0;
	$otros = 0;
	while ($rowViatico = $rsViatico->fetch_object()) {
		$rowViatico->subtotal_viatico2 = (float) $rowViatico->subtotal_viatico2;
		$rowViatico->pasajes2 = (float) $rowViatico->pasajes2;
		$rowViatico->combustible2 = (float) $rowViatico->combustible2;
		$rowViatico->subtotal_alojam2 = (float) $rowViatico->subtotal_alojam2;
		$rowViatico->otros_gastos2 = (float) $rowViatico->otros_gastos2;
		
		$viaticos+= $rowViatico->subtotal_viatico2;
		$pasajes+= $rowViatico->pasajes2;
		$combustible+= $rowViatico->combustible2;
		$alojam+= $rowViatico->subtotal_alojam2;
		$otros+= $rowViatico->otros_gastos2;
		
		
		$sql = "SELECT 001_documentaciones.expediente_fecha FROM salud1.001_documentaciones WHERE documentacion_id='" . $rowViatico->documentacion_id . "'";
		$rsDocumento = $mysqli->query($sql);
		$rowDocumento = $rsDocumento->fetch_object();
		
		$json = json_decode($rowViatico->json);
	?>
		<tr><td>&nbsp;</td></tr>
		<tr><td colspan="6"><table border="2" cellpadding="4" align="center" rules="all" frame="box" width="100%">
		<COLGROUP SPAN="2"></COLGROUP>
		<COLGROUP SPAN="2"></COLGROUP>
		
		<tr>
		<?php
		if ($rowViatico->tipo_viatico=="M") {
			?>
			<td>Mes: <?php echo $meses[substr($rowViatico->fecha_desde2, 5, 2)] ?></td>
			<td>Año: <?php echo substr($rowViatico->fecha_desde2, 0, 4) ?></td>
			<?php
		} else {
			?>
			<td>Salida: <?php echo $rowViatico->fecha_desde2 . " " . substr($rowViatico->hora_desde2, 0, 5) ?></td>
			<td>Regreso: <?php echo $rowViatico->fecha_hasta2 . " " . substr($rowViatico->hora_hasta2, 0, 5) ?></td>			
			<?php
		}
		?>
		<td rowspan="5"><table width="100%" cellpadding="4">
		<tr>
		<td>Viatico:</td>
		<td align="right"><?php echo "$ " . number_format($rowViatico->subtotal_viatico2, 2, ",", ".") ?></td>
		</tr>
		<tr>
		<td>Alojam.:</td>
		<td align="right"><?php echo "$ " . number_format($rowViatico->subtotal_alojam2, 2, ",", ".") ?></td>
		</tr>
		<tr>
		<td>Combus.:</td>
		<td align="right"><?php echo "$ " . number_format($rowViatico->combustible2, 2, ",", ".") ?></td>
		</tr>
		<tr>
		<td>Pasaj.:</td>
		<td align="right"><?php echo "$ " . number_format($rowViatico->pasajes2, 2, ",", ".") ?></td>
		</tr>
		<tr>
		<td>Otros:</td>
		<td align="right"><?php echo "$ " . number_format($rowViatico->otros_gastos2, 2, ",", ".") ?></td>
		</tr>
		</table></td>
		</tr>
		<tr>
		<td>Asunto: <?php echo $rowViatico->documentacion_id ?></td>
		<td>F.exp: <?php echo $rowDocumento->expediente_fecha ?></td>
		</tr>
		</tr>
		<tr>
		<td>Estado: <?php
			if ($rowViatico->estado=="E") echo "Emitido";
			if ($rowViatico->estado=="L") echo "Liquidado";
			if ($rowViatico->estado=="R") echo "Rendido";
			if ($rowViatico->estado=="C") echo "Cerrado";
			if ($rowViatico->estado=="A") echo "Anulado";
		?></td>
		<td>F.liquid.: <?php echo $json->fecha_liquidacion ?></td>
		</tr>
		<tr>
		<td colspan="2">Motivo: <?php echo $rowViatico->descrip ?></td>
		</tr>
		<tr><td colspan="2">
		<table width="100%">
		<tr><td><big>Lugar/es de destino:</big></td></tr>
		<?php
		$sql = "SELECT CONCAT(localidad, ' (', departamento, ')') AS lugar FROM (salud1._localidades INNER JOIN salud1._departamentos USING(departamento_id)) INNER JOIN viatico_localidad USING(localidad_id) WHERE viatico_localidad.id_viatico='" . $rowViatico->id_viatico . "'";
		$rsLocalidad = $mysqli->query($sql);
		while ($rowLocalidad = $rsLocalidad->fetch_object()) {
			echo '<tr><td>' . $rowLocalidad->lugar . '</td></tr>';
		}
		?>
		</table>
		</td></tr>
		</table></td></tr>
	<?php
	}
	?>
	<tr><td>&nbsp;</td></tr>
	<tr><td colspan="6"><table border="2" cellpadding="4" align="center" rules="all" frame="box" width="100%">
	<tr><td>Viático</td><td>Alojam.</td><td>Combus.</td><td>Pasaj.</td><td>Otros</td></tr>
	<tr>
	<td><?php echo "$ " . number_format($viaticos, 2, ",", ".") ?></td>
	<td><?php echo "$ " . number_format($alojam, 2, ",", ".") ?></td>
	<td><?php echo "$ " . number_format($combustible, 2, ",", ".") ?></td>
	<td><?php echo "$ " . number_format($pasajes, 2, ",", ".") ?></td>
	<td><?php echo "$ " . number_format($otros, 2, ",", ".") ?></td>
	</tr>
	</table></td></tr>
	</table>
	</body>
	</html>
	<?php
		
break;
}

	
case 'imprimir_rendicion': {
	
$sql = "SELECT viatico.*, _personal.apenom, _personal.dni, motivo.descrip AS motivo FROM (viatico INNER JOIN salud1._personal USING(id_personal)) INNER JOIN motivo USING(id_motivo) WHERE id_viatico='" . $_REQUEST['id_viatico'] . "'";
$rsViatico = $mysqli->query($sql);
$rowViatico = $rsViatico->fetch_object();

$sql = "SELECT CONCAT(organismo_area, ' (', organismo, ')') AS label, organismo_area_id AS model FROM salud1._organismos_areas INNER JOIN salud1._organismos USING(organismo_id) WHERE organismo_area_id='" . $rowViatico->organismo_area_id . "'";
$rsOrganismo = $mysqli->query($sql);
$rowOrganismo = $rsOrganismo->fetch_object();

$sql = "SELECT CONCAT(localidad, ' (', departamento, ')') AS lugar FROM (salud1._localidades INNER JOIN salud1._departamentos USING(departamento_id)) INNER JOIN viatico_localidad USING(localidad_id) WHERE viatico_localidad.id_viatico='" . $rowViatico->id_viatico . "'";
$rsLocalidad = $mysqli->query($sql);


	?>
	<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
		<title>Impresión de comprobante</title>
	</head>
	<body>
	<input type="submit" value="Imprimir" onClick="window.print();"/>
	<table border="0" cellpadding=0 cellspacing=0 width=750 height=1% align="center">
	<tr><td align="center" colspan="6"><big>RENDICION DE ANTICIPO</big></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td><big>Datos del trámite</big></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td>Fecha: <?php echo $rowViatico->fecha_tramite ?></td></tr>
	<?php
	if ($rowViatico->tipo_viatico=="A") {
		?>
		<tr><td>Asunto: <?php echo $rowViatico->documentacion_id ?></td><td>Nro. anticipo: <?php echo $rowViatico->nro_viatico ?></td></tr>		
		<?php
	} else {
		?>
		<tr><td>Asunto: <?php echo $rowViatico->documentacion_id ?></td></tr>
		<?php
	}
	?>

	<tr><td>&nbsp;</td></tr>
	<tr><td><big>Datos de la persona</big></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td>Ape. y nom.: <?php echo trim($rowViatico->apenom) ?></td><td>Nro.doc.: <?php echo $rowViatico->dni ?></td></tr>
	<tr><td colspan="6">Dependencia: <?php echo $rowOrganismo->label ?></td></tr>
	<tr><td>Motivo: <?php echo $rowViatico->motivo ?></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td><big>Fecha de servicio</big></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td>Salida: <?php echo $rowViatico->fecha_desde2 . " " . substr($rowViatico->hora_desde2, 0, 5) ?></td><td>Regreso: <?php echo $rowViatico->fecha_hasta2 . " " . substr($rowViatico->hora_hasta2, 0, 5) ?></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td><big>Datos del rendición</big></td></tr>
	<tr><td>&nbsp;</td></tr>
	</table>
	<table border="1" rules="rows" cellpadding=0 cellspacing=0 width=650 height=1% align="center">
	<tr align="right"><td>&nbsp;</td><td>&nbsp;</td><td>Recibido</td><td>Rendido</td></tr>
	<tr><td>Viáticos:</td><td><?php echo $rowViatico->cant_dias_viatico1 . " dia/s a $ " . $rowViatico->monto_diario_viatico . " diarios + $ " . $rowViatico->adicional_viatico1 . " adic." ?></td><td align="right"><?php echo "$ " . $rowViatico->subtotal_viatico1 ?></td><td align="right"><?php echo "$ " . $rowViatico->subtotal_viatico2 ?></td></tr>
	<tr><td>Pasajes:</td><td>&nbsp;</td><td align="right"><?php echo "$ " . $rowViatico->pasajes1 ?></td><td align="right"><?php echo "$ " . $rowViatico->pasajes2 ?></td></tr>
	<tr><td>Combustible:</td><td>&nbsp;</td><td align="right"><?php echo "$ " . $rowViatico->combustible1 ?></td><td align="right"><?php echo "$ " . $rowViatico->combustible2 ?></td></tr>
	<tr><td>Alojamiento:</td><td>&nbsp;</td><td align="right"><?php echo "$ " . $rowViatico->subtotal_alojam1 ?></td><td align="right"><?php echo "$ " . $rowViatico->subtotal_alojam2 ?></td></tr>
	<tr><td>Otros:</td><td>&nbsp;</td><td align="right"><?php echo "$ " . $rowViatico->otros_gastos1 ?></td><td align="right"><?php echo "$ " . $rowViatico->otros_gastos2 ?></td></tr>
	<tr>
		<td>&nbsp;</td>
		<td>TOTAL:</td>
		<?php
		$importe_aux = (float) $rowViatico->subtotal_viatico1 + (float) $rowViatico->pasajes1 + (float) $rowViatico->combustible1 + (float) $rowViatico->subtotal_alojam1 + (float) $rowViatico->otros_gastos1
		?>
		<td align="right"><?php echo "$ " . number_format((float) $rowViatico->subtotal_viatico1 + (float) $rowViatico->pasajes1 + (float) $rowViatico->combustible1 + (float) $rowViatico->subtotal_alojam1 + (float) $rowViatico->otros_gastos1, 2) ?></td>
		<td align="right"><?php echo "$ " . number_format((float) $rowViatico->subtotal_viatico2 + (float) $rowViatico->pasajes2 + (float) $rowViatico->combustible2 + (float) $rowViatico->subtotal_alojam2 + (float) $rowViatico->otros_gastos2, 2) ?></td>
	</tr>
	<tr>
		<td>&nbsp;</td>
		<td>DIFERENCIA: $ <?php echo number_format((float) $rowViatico->importe_total - $importe_aux, 2); ?></td>
	</tr>
	</table>
	
	<table border="0" cellpadding=0 cellspacing=0 width=750 height=1% align="center">
	<tr><td>&nbsp;</td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr align="center"><td>......................</td><td>......................</td><td>......................</td></tr>
	<tr align="center"><td>Solicitante</td><td>Responsable</td><td>Operador</td></tr>
	</table>
	</body>
	</html>
	<?php

break;
}
	
	
case 'imprimir_viatico': {
	
$sql = "SELECT viatico.*, _personal.apenom, _personal.dni, motivo.descrip AS motivo FROM (viatico INNER JOIN salud1._personal USING(id_personal)) INNER JOIN motivo USING(id_motivo) WHERE id_viatico='" . $_REQUEST['id_viatico'] . "'";
$rsViatico = $mysqli->query($sql);
$rowViatico = $rsViatico->fetch_object();

$sql = "SELECT 001_documentaciones.*, 001_documentaciones_tipos.documentacion_tipo FROM salud1.001_documentaciones INNER JOIN salud1.001_documentaciones_tipos USING(documentacion_tipo_id) WHERE documentacion_id='" . $rowViatico->documentacion_id . "'";
$rsDocumento = $mysqli->query($sql);
$rowDocumento = $rsDocumento->fetch_object();
$documento = (($rowDocumento->documentacion_tipo_id=="1") ? $rowDocumento->expediente_numero . "-" . $rowDocumento->expediente_codigo . "-" . $rowDocumento->expediente_ano : $rowDocumento->documentacion_numero . "/" . $rowDocumento->documentacion_numero_ano);
$documento = $rowDocumento->documentacion_tipo . " Nro. " . $documento; 

$sql = "SELECT CONCAT(organismo_area, ' (', organismo, ')') AS label, organismo_area_id AS model FROM salud1._organismos_areas INNER JOIN salud1._organismos USING(organismo_id) WHERE organismo_area_id='" . $rowViatico->organismo_area_id_origen . "'";
$rsOrganismo = $mysqli->query($sql);
$rowOrganismo = $rsOrganismo->fetch_object();

$sql = "SELECT CONCAT(localidad, ' (', departamento, ')') AS lugar FROM (salud1._localidades INNER JOIN salud1._departamentos USING(departamento_id)) INNER JOIN viatico_localidad USING(localidad_id) WHERE viatico_localidad.id_viatico='" . $rowViatico->id_viatico . "'";
$rsLocalidad = $mysqli->query($sql);
$localidad = array();
while ($rowLocalidad = $rsLocalidad->fetch_object()) {
	$localidad[] = trim($rowLocalidad->lugar);
}


if ($rowViatico->tipo_viatico=="M") {
	$json = json_decode($rowViatico->json);
	
	$importe = $json->cant_dias->dp12 * $json->diario->diario_12_dp;
	$importe+= $json->cant_dias->dp34 * $json->diario->diario_34_dp;
	$importe+= $json->cant_dias->dp1 * $json->diario->diario_dp;
	$importe+= $json->cant_dias->fp12 * $json->diario->diario_12_fp;
	$importe+= $json->cant_dias->fp34 * $json->diario->diario_34_fp;
	$importe+= $json->cant_dias->fp1 * $json->diario->diario_fp;
	$importe+= (float) $rowViatico->subtotal_alojam2;
	$importe+= (float) $rowViatico->pasajes2;
	
	
	$meses = array();
	$meses["01"] = "Enero";
	$meses["02"] = "Febrero";
	$meses["03"] = "Marzo";
	$meses["04"] = "Abril";
	$meses["05"] = "Mayo";
	$meses["06"] = "Junio";
	$meses["07"] = "Julio";
	$meses["08"] = "Agosto";
	$meses["09"] = "Septiembre";
	$meses["10"] = "Octubre";
	$meses["11"] = "Noviembre";
	$meses["12"] = "Diciembre";
	
	?>
	<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
		<title>Impresión de comprobante</title>
	</head>
	<body>
	<input type="submit" value="Imprimir" onClick="window.print();"/>
	<table style="font-size:large;" border="0" cellpadding="0" cellspacing="0" width="750" align="center">
	<tr><td colspan="6"><IMG SRC="../../../resource/viaticos/logo.png" width="70" height="75""></td></tr>
	<tr><td style="font-size:larger;" align="center" colspan="5"><B><U>REGISTRO DE REINTEGRO MENSUAL</U></B></td></tr>
	
	<tr><td>&nbsp;</td></tr>
	<tr><td><B>FECHA: <?php echo $rowViatico->fecha_tramite ?></B></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td><B><U>DATOS DE LA GESTION</U></B></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td><B>ASUNTO Nº <?php echo $rowViatico->documentacion_id ?></B></td><td style="font-size:smaller;"><B><U><?php echo $documento ?></U></B></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td><B><U>DATOS DEL SOLICITANTE</U></B></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td colspan="6"><table style="font-size:large;" border="1" rules="all" cellpadding="10" cellspacing="0" width="100%" align="center">
	<tr style="font-size:smaller;"><td>Apellido y nombre: <B><?php echo trim($rowViatico->apenom) ?></B></td><td>N.DOC.: <B><?php echo $rowViatico->dni ?></B></td></tr>
	<tr rowspan="2"><td style="font-size:smaller; word-wrap:break-word" colspan="6">Dependencia: <?php echo $rowOrganismo->label ?></td></tr>
	<tr><td colspan="6" style="font-size:smaller;">Motivo: <?php echo $rowViatico->motivo ?></td></tr>
	<tr><td colspan="6" style="font-size:smaller;">Destino/s:
	
	<table border="0" rules="none" width="100%"><tr>
	<?php
	for ($x = 0; $x <= 2; $x++){
		echo '<td style="font-size:smaller;">' . $localidad[$x] . '</td>';
	}
	?>	
	</tr>
	<tr>
	<?php
	for ($x = 3; $x <= 5; $x++){
		echo '<td style="font-size:smaller;">' . $localidad[$x] . '</td>';
	}
	?>	
	</tr>
	<tr>
	<?php
	for ($x = 6; $x <= 8; $x++){
		echo '<td style="font-size:smaller;">' . $localidad[$x] . '</td>';
	}
	?>	
	</tr></table></td></tr>
	
	<tr style="font-size:smaller;"><td>Mes: <B><?php echo $meses[substr($rowViatico->fecha_desde2, 5, 2)] ?></B></td><td>Año: <B><?php echo substr($rowViatico->fecha_desde2, 0, 4) ?></B></td></tr>
	</table></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td><B><U>A COMPUTAR</U></B></td></tr>
	<tr><td>&nbsp;</td></tr>
	</table>
	<table border="1" rules="all" cellpadding="10" cellspacing="0" width="750" align="center">
	<tr><td colspan="3">DENTRO DE PROVINCIA</td></tr>
	<tr><td>1/2 dia</td><td align="right"><?php echo $json->cant_dias->dp12 ?></td><td align="right"><?php echo "$ " . number_format($json->diario->diario_12_dp, 2, ",", ".") ?></td><td align="right">Alojamiento:</td><td align="right"><?php echo "$ " . number_format($rowViatico->subtotal_alojam2, 2, ",", ".") ?></td></tr>
	<tr><td>3/4 dia</td><td align="right"><?php echo $json->cant_dias->dp34 ?></td><td align="right"><?php echo "$ " . number_format($json->diario->diario_34_dp, 2, ",", ".") ?></td><td align="right">Pasajes:</td><td align="right"><?php echo "$ " . number_format($rowViatico->pasajes2, 2, ",", ".") ?></td></tr>
	<tr><td>1 dia</td><td align="right"><?php echo $json->cant_dias->dp1 ?></td><td align="right"><?php echo "$ " . number_format($json->diario->diario_dp, 2, ",", ".") ?></td></tr>
	<tr><td colspan="3">FUERA DE PROVINCIA</td></tr>
	<tr><td>1/2 dia</td><td align="right"><?php echo $json->cant_dias->fp12 ?></td><td align="right"><?php echo "$ " . number_format($json->diario->diario_12_fp, 2, ",", ".") ?></td></tr>
	<tr><td>3/4 dia</td><td align="right"><?php echo $json->cant_dias->fp34 ?></td><td align="right"><?php echo "$ " . number_format($json->diario->diario_34_fp, 2, ",", ".") ?></td></tr>
	<tr><td>1 dia</td><td align="right"><?php echo $json->cant_dias->fp1 ?></td><td align="right"><?php echo "$ " . number_format($json->diario->diario_fp, 2, ",", ".") ?></td><td align="right">Importe final:</td><td align="right"><?php echo "$ " . number_format($importe, 2, ",", ".") ?></td></tr>
	

	</table>
	
	<table border="0" cellpadding="0" cellspacing="0" width="750" align="center">
	<tr><td>&nbsp;</td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr align="center"><td>......................</td><td>......................</td><td>......................</td></tr>
	<tr align="center"><td>Solicitante</td><td>Responsable</td><td>Operador</td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr align="center"><td colspan="6"><I>Sistema de Registro de Viaticos-Direccion de Informatica MS y DS</I></td></tr>
	</table>
	</body>
	</html>
	<?php
} else {
	?>
	<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
		<title>Impresión de comprobante</title>
	</head>
	<body>
	<input type="submit" value="Imprimir" onClick="window.print();"/>
	<table style="font-size:large;" border="0" cellpadding="0" cellspacing="0" width="750" align="center">
	<tr><td colspan="6"><IMG SRC="../../../resource/viaticos/logo.png" width="70" height="75"></td></tr>
	<?php
	if ($rowViatico->tipo_viatico=="A") {
		?>
		<tr><td style="font-size:larger;" align="center" colspan="5"><B><U>REGISTRO DE ANTICIPO</U></B></td></tr>
		<?php
	} else {
		?>
		<tr><td style="font-size:larger;" align="center" colspan="5"><B><U>REGISTRO DE REINTEGRO</U></B></td></tr>
		<?php
	}
	?>
	
	<tr><td>&nbsp;</td></tr>
	<tr><td><B>FECHA: <?php echo $rowViatico->fecha_tramite ?></B></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td><B><U>DATOS DE LA GESTION</U></B></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td><B>ASUNTO Nº <?php echo $rowViatico->documentacion_id ?></B></td><td style="font-size:smaller;"><B><U><?php echo $documento ?></U></B></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td><B><U>DATOS DEL SOLICITANTE</U></B></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr rowspan="10"><td colspan="6"><table style="font-size:large;" border="1" rules="all" cellpadding="10" cellspacing="0" width="100%" align="center">
	<tr style="font-size:smaller;"><td>Apellido y nombre: <B><?php echo trim($rowViatico->apenom) ?></B></td><td>N.DOC.: <B><?php echo $rowViatico->dni ?></B></td></tr>
	<tr rowspan="2"><td style="font-size:smaller; word-wrap:break-word" colspan="6">Dependencia: <?php echo $rowOrganismo->label ?></td></tr>
	<tr><td colspan="6" style="font-size:smaller;">Motivo: <?php echo $rowViatico->motivo ?></td></tr>
	<tr><td colspan="6" style="font-size:smaller;">Destino/s:
	
	<table border="0" rules="none" width="100%"><tr>
	<?php
	for ($x = 0; $x <= 2; $x++){
		echo '<td style="font-size:smaller;">' . $localidad[$x] . '</td>';
	}
	?>	
	</tr>
	<tr>
	<?php
	for ($x = 3; $x <= 5; $x++){
		echo '<td style="font-size:smaller;">' . $localidad[$x] . '</td>';
	}
	?>	
	</tr>
	<tr>
	<?php
	for ($x = 6; $x <= 8; $x++){
		echo '<td style="font-size:smaller;">' . $localidad[$x] . '</td>';
	}
	?>	
	</tr></table></td></tr>

	<tr style="font-size:smaller;"><td>Salida: <B><?php echo $rowViatico->fecha_desde2 . " " . substr($rowViatico->hora_desde2, 0, 5) ?></B></td><td>Regreso: <B><?php echo $rowViatico->fecha_hasta2 . " " . substr($rowViatico->hora_hasta2, 0, 5) ?></B></td></tr>
	</table></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td><B><U>VIATICO A OTORGAR</U></B></td></tr>
	<tr><td>&nbsp;</td></tr>
	</table>
	<table border="1" rules="all" cellpadding="10" cellspacing="0" width="750" align="center">
	<tr><td>Viáticos:</td><td><?php echo $rowViatico->cant_dias_viatico2 . " dia/s a $ " . number_format($rowViatico->monto_diario_viatico, 2, ",", ".") . " diarios + $ " . number_format($rowViatico->adicional_viatico2, 2, ",", ".") . " adic." . '</td><td>' . (($rowViatico->fuera_provincia=="1") ? "fuera de prov." : "dentro de prov.") ?></td><td align="right"><?php echo "$ " . number_format($rowViatico->subtotal_viatico2, 2, ",", ".") ?></td></tr>
	<tr><td>Pasajes:</td><td colspan="2">&nbsp;</td><td align="right"><?php echo "$ " . number_format($rowViatico->pasajes2, 2, ",", ".") ?></td></tr>
	<tr><td>Combustible:</td><td colspan="2">&nbsp;</td><td align="right"><?php echo "$ " . number_format($rowViatico->combustible2, 2, ",", ".") ?></td></tr>
	<tr><td>Alojamiento:</td><td><?php echo $rowViatico->cant_dias_alojam2 . " noche/s a $ " . number_format($rowViatico->monto_diario_alojam, 2, ",", ".") . " pernoct." . '</td><td>' . (($rowViatico->fuera_provincia=="1") ? "fuera de prov." : "dentro de prov.") ?></td><td align="right"><?php echo "$ " . number_format($rowViatico->subtotal_alojam2, 2, ",", ".") ?></td></tr>
	<tr><td>Otros:</td><td colspan="2">&nbsp;</td><td align="right"><?php echo "$ " . number_format($rowViatico->otros_gastos2, 2, ",", ".") ?></td></tr>
	<tr><td colspan="2">&nbsp;</td><td>TOTAL:</td><td align="right"><?php echo "$ " . number_format((float) $rowViatico->subtotal_viatico2 + (float) $rowViatico->pasajes2 + (float) $rowViatico->combustible2 + (float) $rowViatico->subtotal_alojam2 + (float) $rowViatico->otros_gastos2, 2, ",", ".") ?></td></tr>
	</table>
	
	<table border="0" cellpadding="0" cellspacing="0" width="750" align="center">
	<tr><td>&nbsp;</td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr align="center"><td>......................</td><td>......................</td><td>......................</td></tr>
	<tr align="center"><td>Solicitante</td><td>Responsable</td><td>Operador</td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr align="center"><td colspan="6"><I>Sistema de Registro de Viaticos-Direccion de Informatica MS y DS</I></td></tr>
	</table>
	</body>
	</html>
	<?php
}

break;
}


}

?>
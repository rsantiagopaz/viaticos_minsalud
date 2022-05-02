<?php

session_start();

set_time_limit(0);

date_default_timezone_set("America/Argentina/Buenos_Aires");

require('conexion.php');

$mysqli = new mysqli("$servidor", "$usuario", "$password", "$base");
$mysqli->query("SET NAMES 'utf8'");


$sql = "SELECT COUNT(id_viatico) AS cantidad, SUM(subtotal_viatico2) AS subtotal_viatico2, SUM(pasajes2) AS pasajes2, SUM(combustible2) AS combustible2, SUM(subtotal_alojam2) AS subtotal_alojam2, SUM(otros_gastos2) AS otros_gastos2, TRUE as grupo FROM viatico WHERE estado <> 'A' AND organismo_area_id_origen='" . $_REQUEST['organismo_area_id'] . "' AND (fecha_desde2 BETWEEN '" . $_REQUEST['desde'] . "' AND '" . $_REQUEST['hasta'] . "') GROUP BY grupo";
$rsViatico = $mysqli->query($sql);
$rowViatico = $rsViatico->fetch_object();

$tipo_descrip = "CASE tipo_viatico WHEN 'A' THEN 'Anticipo' WHEN 'R' THEN 'Reintegro' ELSE 'R.Mensual' END AS tipo_descrip";
$sql = "SELECT viatico.*, " . $tipo_descrip . ", _personal.apenom FROM viatico INNER JOIN salud1._personal USING(id_personal) WHERE estado <> 'A' AND organismo_area_id_origen='" . $_REQUEST['organismo_area_id'] . "' AND (fecha_desde2 BETWEEN '" . $_REQUEST['desde'] . "' AND '" . $_REQUEST['hasta'] . "') ORDER BY fecha_tramite DESC";
$rsViaticos = $mysqli->query($sql);

$sql = "SELECT CONCAT(organismo_area, ' (', organismo, ')') AS label, organismo_area_id AS model FROM salud1._organismos_areas INNER JOIN salud1._organismos USING(organismo_id) WHERE organismo_area_id='" . $_REQUEST['organismo_area_id'] . "'";
$rsOrganismo = $mysqli->query($sql);
$rowOrganismo = $rsOrganismo->fetch_object();

$date = date('Ymd_His');
$filename = str_replace(' ', '_' , $rowOrganismo->label) . "_" . $date . ".xls";

header("Pragma: public");
header("Expires: 0");
header("Content-type: application/x-msdownload");
header("Content-Disposition: attachment; filename=$filename");
header("Pragma: no-cache");
header("Cache-Control: must-revalidate, post-check=0, pre-check=0");

?>
	<table border="0" cellpadding=0 cellspacing=0 width=750 height=1% align="center">
	<tr><td align="center" colspan="6"><big>TOTAL POR DEPENDENCIA	<?php echo $_REQUEST['desde'] . " - " . $_REQUEST['hasta']  ?></big></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td><big>Datos</big></td></tr>
	<tr><td colspan="6">Dependencia: <?php echo $rowOrganismo->label ?></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td>Cantidad viaticos: <?php echo $rowViatico->cantidad ?></td><td align="right">TOTAL: <?php echo "$ " . number_format((float) $rowViatico->subtotal_viatico2 + (float) $rowViatico->pasajes2 + (float) $rowViatico->combustible2 + (float) $rowViatico->subtotal_alojam2 + (float) $rowViatico->otros_gastos2, 2, ",", ".") ?></td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td>&nbsp;</td></tr>
	<tr><td colspan="6">
	<table border="2" cellpadding="4" align="center" rules="all" frame="box" width="100%">
	<tr><th>Asunto</th><th>F.tramite</th><th>Apellido nombre</th><th>Tipo</th><th>Total</th></tr>
	<?php
	while ($rowViaticos = $rsViaticos->fetch_object()) {
		$total = (float) $rowViaticos->subtotal_viatico2 + (float) $rowViaticos->pasajes2 + (float) $rowViaticos->combustible2 + (float) $rowViaticos->subtotal_alojam2 + (float) $rowViaticos->otros_gastos2;
		$total = number_format($total, 2, ",", ".");
		?>
		<tr><td><?php echo $rowViaticos->documentacion_id ?></td><td><?php echo substr($rowViaticos->fecha_tramite, 0, 10) ?></td><td><?php echo $rowViaticos->apenom ?></td><td><?php echo $rowViaticos->tipo_descrip ?></td><td align="right"><?php echo $total ?></td></tr>
		<?php
	}
	?>
	</table>
	</td></tr>
	</table>
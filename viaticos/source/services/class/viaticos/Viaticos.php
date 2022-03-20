<?php

require("Base.php");

class class_Viaticos extends class_Base
{
  
  
  public function method_validar_alta_modifica_viatico($params, $error) {
  	$p = $params[0];
  	
  	$resultado = new stdClass;
  	$resultado->error = array();
  	
  	
  	$fecha_desde = substr($p->model->fecha_desde2, 0, 10) . " " . $p->model->hora_desde2;
  	$fecha_hasta = substr($p->model->fecha_hasta2, 0, 10) . " " . $p->model->hora_hasta2;
  	
	if (!is_null($p->model->COD_VEHICULO) && $p->model->estado != "R") {
	  	$sql = "SELECT id_viatico, documentacion_id FROM viatico WHERE estado <> 'A' AND id_viatico <> '" . $p->model->id_viatico . "' AND documentacion_id <> '" . $p->model->documentacion_id . "' AND COD_VEHICULO='" . $p->model->COD_VEHICULO . "' AND GREATEST(ADDTIME(fecha_desde2, hora_desde2), '" . $fecha_desde . "') - LEAST(ADDTIME(fecha_hasta2, hora_hasta2), '" . $fecha_hasta . "') < 0";
		$rs = $this->mysqli->query($sql);
		if ($rs->num_rows > 0) {
			$row = $rs->fetch_object();
			$item = new stdClass();
			$item->descrip = "vehiculo";
			$item->message = " El vehículo oficial seleccionado está asignado a viático " . $row->documentacion_id . " en conflicto con el intervalo definido ";
			$resultado->error[] = $item;
		}
	}
  	
  	$sql = "SELECT id_viatico FROM viatico WHERE estado <> 'A' AND id_viatico <> '" . $p->model->id_viatico . "' AND id_personal='" . $p->model->id_personal . "' AND GREATEST(ADDTIME(fecha_desde2, hora_desde2), '" . $fecha_desde . "') - LEAST(ADDTIME(fecha_hasta2, hora_hasta2), '" . $fecha_hasta . "') < 0";
	$rs = $this->mysqli->query($sql);
	if ($rs->num_rows > 0) {
		$item = new stdClass();
		$item->descrip = "intervalo";
		$item->message = " El titular ya tiene un viático asignado que está en conflicto con este intervalo definido ";
		$resultado->error[] = $item;
	}
	

	if ($p->validar_tope) {
	  	$sql = "SELECT SUM(subtotal_viatico2) AS total, id_personal FROM viatico WHERE estado <> 'A' AND id_viatico <> '" . $p->model->id_viatico . "' AND id_personal='" . $p->model->id_personal . "' AND YEAR(fecha_desde2)=" . substr($fecha_desde, 0, 4) . " AND MONTH(fecha_desde2)=" . substr($fecha_desde, 5, 2) . " GROUP BY id_personal";
		$rs = $this->mysqli->query($sql);
		if ($rs->num_rows > 0) {
			$row = $rs->fetch_object();
			$total = (float) $row->total;
		} else {
			$total = 0;
		}
		
		$sql = "SELECT porc_tope_cargo FROM paramet WHERE id_paramet=1";
		$rs = $this->mysqli->query($sql);
		$row = $rs->fetch_object();
		$porc_tope_cargo = (float) $row->porc_tope_cargo;
		
		if ($total + $p->model->subtotal_viatico2 > $p->model->codigo_002per * $porc_tope_cargo / 100) {
			$item = new stdClass();
			$item->descrip = "porc_tope_cargo";
			$item->message = "Con este importe de viático $" . $p->model->subtotal_viatico2 . " se supera tope mensual";
			$resultado->error[] = $item;
		}
	}

	

	$sql = "SELECT documentacion_id FROM salud1.001_documentaciones WHERE documentacion_id='" . $p->model->documentacion_id . "'";
	$rs = $this->mysqli->query($sql);
	$bool1 = ($rs->num_rows==0);
	$sql = "SELECT organismo_area_de_id, organismo_area_para_id FROM salud1.001_documentaciones_seguimientos WHERE documentacion_id='" . $p->model->documentacion_id . "' ORDER BY seguimiento_id_orden DESC LIMIT 1";
	$rs = $this->mysqli->query($sql);
	$row = $rs->fetch_object();
	$bool2 = ($row->organismo_area_de_id != $p->model->organismo_area_id || trim($row->organismo_area_para_id) != "");
	if (($bool1 || $bool2) && $p->model->estado != "R") {
		$item = new stdClass();
		$item->descrip = "documentacion_id";
		$item->message = " Asunto inválido ";
		//$resultado->error[] = $item;
	}

	
	
	
	
	if (count($resultado->error)==0) {
		if ($p->model->con_funcionario && $p->model->estado=="E") {
			$sql = "UPDATE salud1._personal SET codigo_002='" . $p->model->codigo_002fun . "' WHERE id_personal = '" . $p->model->id_funcionario . "'";
			$this->mysqli->query($sql);
		} else {
			$p->model->id_funcionario = null;
		}
		
		if ($p->model->estado=="E") {
			$sql = "UPDATE salud1._personal SET codigo_002='" . $p->model->codigo_002per . "' WHERE id_personal = '" . $p->model->id_personal . "'";
			$this->mysqli->query($sql);
		}
		
		$resultado->id_viatico = $p->model->id_viatico;
		if ($resultado->id_viatico=="0") {
			$set = $this->prepararCampos($p->model, "viatico");
			$sql = "INSERT viatico SET " . $set . ", fecha_tramite=NOW()";
			$this->mysqli->query($sql);
			$resultado->id_viatico = $this->mysqli->insert_id;
			if ($p->model->tipo_viatico=="A") {
				$sql = "UPDATE paramet SET nro_viatico='" . $p->model->nro_viatico . "' WHERE id_paramet = 1";
				$this->mysqli->query($sql);
			}
		} else {
			if ($p->model->estado=="E") {
				$sql="DELETE FROM viatico_localidad WHERE id_viatico='" . $resultado->id_viatico . "'";
				$this->mysqli->query($sql);
			}
			
			unset($p->model->organismo_area_id);
			$set = $this->prepararCampos($p->model, "viatico");
			
			$sql = "UPDATE viatico SET " . $set . " WHERE id_viatico='" . $resultado->id_viatico . "'";
			$this->mysqli->query($sql);
		}
		
		if ($p->model->estado=="E") {
			foreach ($p->localidad as $item) {
				$sql = "INSERT viatico_localidad SET id_viatico='" . $resultado->id_viatico . "', localidad_id='" . $item . "'";
				$this->mysqli->query($sql);
			}
		}
	}
	
	return $resultado;
  }


  public function method_estado_viatico($params, $error) {
  	$p = $params[0];

	$sql = "UPDATE viatico SET estado = '" . $p->estado . "', json = '" . $p->json . "' WHERE id_viatico='" . $p->id_viatico . "'";
	$this->mysqli->query($sql);
  }
  
  
  public function method_rendir_viatico($params, $error) {
  	$p = $params[0];
  	$set = $this->prepararCampos($p->model, "viatico");

	$sql = "UPDATE viatico SET " . $set . " WHERE id_viatico='" . $p->model->id_viatico . "'";
	$this->mysqli->query($sql);
  }
    
  
  public function method_leer_viatico($params, $error) {
  	$p = $params[0];
  	
  	$id_viatico = $p;

	$resultado = new stdClass();
	$sql = "SELECT * FROM viatico WHERE id_viatico='" . $id_viatico . "'";
	$resultado->viatico = $this->toJson($sql);
	$resultado->viatico = $resultado->viatico[0];

	$resultado->viatico->nro_viatico = (int) $resultado->viatico->nro_viatico;
	$resultado->viatico->fuera_provincia = (bool) $resultado->viatico->fuera_provincia;
	$resultado->viatico->cant_dias_viatico1 = (int) $resultado->viatico->cant_dias_viatico1;
	$resultado->viatico->monto_diario_viatico = (float) $resultado->viatico->monto_diario_viatico;
	$resultado->viatico->adicional_viatico1 = (float) $resultado->viatico->adicional_viatico1;
	$resultado->viatico->subtotal_viatico1 = (float) $resultado->viatico->subtotal_viatico1;
	$resultado->viatico->combustible1 = (float) $resultado->viatico->combustible1;
	$resultado->viatico->pasajes1 = (float) $resultado->viatico->pasajes1;
	$resultado->viatico->otros_gastos1 = (float) $resultado->viatico->otros_gastos1;
	$resultado->viatico->cant_dias_alojam1 = (int) $resultado->viatico->cant_dias_alojam1;
	$resultado->viatico->monto_diario_alojam = (float) $resultado->viatico->monto_diario_alojam;
	$resultado->viatico->subtotal_alojam1 = (float) $resultado->viatico->subtotal_alojam1;
	$resultado->viatico->con_funcionario = (bool) $resultado->viatico->con_funcionario;
	$resultado->viatico->nro_cheque = (int) $resultado->viatico->nro_cheque;
	$resultado->viatico->subtotal_viatico2 = (float) $resultado->viatico->subtotal_viatico2;
	$resultado->viatico->subtotal_alojam2 = (float) $resultado->viatico->subtotal_alojam2;
	$resultado->viatico->combustible2 = (float) $resultado->viatico->combustible2;
	$resultado->viatico->pasajes2 = (float) $resultado->viatico->pasajes2;
	$resultado->viatico->otros_gastos2 = (float) $resultado->viatico->otros_gastos2;
	$resultado->viatico->importe_total = (float) $resultado->viatico->importe_total;
	
	
	$sql = "SELECT CONCAT(organismo_area, ' (', organismo, ')') AS label, organismo_area_id AS model FROM salud1._organismos_areas INNER JOIN salud1._organismos USING(organismo_id) WHERE organismo_area_id='" . $resultado->viatico->organismo_area_id . "'";
	$resultado->cboOrganismoArea = $this->toJson($sql);
	$resultado->cboOrganismoArea = $resultado->cboOrganismoArea[0];
	
	$sql = "SELECT CONCAT(TRIM(apenom), ' (', dni, ')') AS label, id_personal AS model, codigo_002, funcionario, eximir_tope_viatico FROM salud1._personal WHERE id_personal='" . $resultado->viatico->id_personal . "'";
	$opciones = array("funcionario"=>"bool", "eximir_tope_viatico"=>"bool");
	$resultado->cboPersonal = $this->toJson($sql, $opciones);
	$resultado->cboPersonal = $resultado->cboPersonal[0];
	
	$sql = "SELECT descrip AS label, id_motivo AS model FROM motivo WHERE id_motivo='" . $resultado->viatico->id_motivo . "'";
	$resultado->cboMotivo = $this->toJson($sql);
	$resultado->cboMotivo = $resultado->cboMotivo[0];
	
	$sql = "SELECT CONCAT(organismo_area, ' (', organismo, ')') AS label, organismo_area_id AS model FROM salud1._organismos_areas INNER JOIN salud1._organismos USING(organismo_id) WHERE organismo_area_id='" . $resultado->viatico->organismo_area_id_origen . "'";
	$resultado->cboOrganismoAreaOrigen = $this->toJson($sql);
	$resultado->cboOrganismoAreaOrigen = $resultado->cboOrganismoAreaOrigen[0];
	
	//SELECT CONCAT(NRO_PAT, '  ', MARCA) AS label, COD_VEHICULO AS model FROM 017.vehiculos WHERE COD_VEHICULO='9'
	$sql = "SELECT CONCAT(NRO_PAT, '  ', MARCA) AS label, COD_VEHICULO AS model FROM `017`.vehiculos WHERE COD_VEHICULO = '" . $resultado->viatico->COD_VEHICULO . "'";
	$resultado->cboVehiculo = $this->toJson($sql);
	$resultado->cboVehiculo = $resultado->cboVehiculo[0];
	
	$sql = "SELECT CONCAT(TRIM(apenom), ' (', dni, ')') AS label, id_personal AS model, codigo_002, funcionario FROM salud1._personal WHERE id_personal='" . $resultado->viatico->id_funcionario . "'";
	$opciones = array("funcionario"=>"bool");
	$resultado->cboFuncionario = $this->toJson($sql, $opciones);
	$resultado->cboFuncionario = $resultado->cboFuncionario[0];
	
	/*
	$sql = "SELECT descrip AS label, id_cta_cte AS model FROM cta_cte WHERE id_cta_cte='" . $resultado->viatico->id_cta_cte . "'";
	$resultado->cboCtaCte = $this->toJson($sql);
	$resultado->cboCtaCte = $resultado->cboCtaCte[0];
	*/
	
	$sql = "SELECT CONCAT(salud1._localidades.localidad, ' (', salud1._departamentos.departamento, ')') AS label, viatico_localidad.localidad_id AS model FROM (viatico_localidad INNER JOIN salud1._localidades USING(localidad_id)) INNER JOIN salud1._departamentos USING(departamento_id) WHERE viatico_localidad.id_viatico='" . $id_viatico . "'";
	$resultado->localidad = $this->toJson($sql);
	
	return $resultado;
  }

  public function method_leer_viaticos($params, $error) {
  	$p = $params[0];
  	
  	//set_time_limit(0);
  	
  	$resultado = array();
  	
	$where = "";
	if (! is_null($p->desde)) $where.= " AND DATE(fecha_tramite) >= '" . substr($p->desde, 0, 10) . "'";
	if (! is_null($p->hasta)) $where.= " AND DATE(fecha_tramite) <= '" . substr($p->hasta, 0, 10) . "'";
  	
  	$tipo_descrip = "CASE tipo_viatico WHEN 'A' THEN 'Anticipo' WHEN 'R' THEN 'Reintegro' ELSE 'R.Mensual' END AS tipo_descrip";
  	$estado_descrip = "CASE estado WHEN 'E' THEN 'Emitido' WHEN 'L' THEN 'Liquidado' WHEN 'R' THEN 'Rendido' WHEN 'C' THEN 'Cerrado' ELSE 'Anulado' END AS estado_descrip";

	//$sql = "(SELECT id_viatico, documentacion_id, organismo_area_id, organismo_area_id_origen, apenom, importe_total, viatico.json, tipo_viatico, estado, " . $tipo_descrip . ", " . $estado_descrip . " FROM viatico INNER JOIN salud1._personal USING(id_personal) WHERE _personal.apenom LIKE '%" . $p->filtrar . "%')";
	//$sql = "(SELECT id_viatico, documentacion_id, fecha_tramite, organismo_area_id, organismo_area_id_origen, apenom, importe_total, viatico.json, tipo_viatico, estado, " . $tipo_descrip . ", " . $estado_descrip . " FROM viatico INNER JOIN salud1._personal USING(id_personal) WHERE TRUE" . $where . " AND _personal.apenom LIKE '%" . $p->filtrar . "%')";
	$sql = "(SELECT id_viatico, documentacion_id, DATE(fecha_tramite) AS fecha_tramite, organismo_area_id, organismo_area_id_origen, apenom, importe_total, tipo_viatico, estado, " . $tipo_descrip . ", " . $estado_descrip . " FROM viatico INNER JOIN salud1._personal USING(id_personal) WHERE TRUE" . $where . " AND _personal.apenom LIKE '%" . $p->filtrar . "%')";
	$sql.= " UNION ";
	//$sql.= "(SELECT id_viatico, documentacion_id, organismo_area_id, organismo_area_id_origen, apenom, importe_total, viatico.json, tipo_viatico, estado, " . $tipo_descrip . ", " . $estado_descrip . " FROM viatico INNER JOIN salud1._personal USING(id_personal) WHERE viatico.documentacion_id LIKE '" . $p->filtrar . "%')";
	//$sql.= "(SELECT id_viatico, documentacion_id, fecha_tramite, organismo_area_id, organismo_area_id_origen, apenom, importe_total, viatico.json, tipo_viatico, estado, " . $tipo_descrip . ", " . $estado_descrip . " FROM viatico INNER JOIN salud1._personal USING(id_personal) WHERE TRUE" . $where . " AND viatico.documentacion_id LIKE '" . $p->filtrar . "%')";
	$sql.= "(SELECT id_viatico, documentacion_id, DATE(fecha_tramite) AS fecha_tramite, organismo_area_id, organismo_area_id_origen, apenom, importe_total, tipo_viatico, estado, " . $tipo_descrip . ", " . $estado_descrip . " FROM viatico INNER JOIN salud1._personal USING(id_personal) WHERE TRUE" . $where . " AND viatico.documentacion_id LIKE '" . $p->filtrar . "%')";
	$sql.= " ORDER BY fecha_tramite DESC";
	$rs = $this->mysqli->query($sql);
	while ($row = $rs->fetch_object()) {
		$row->importe_total = (float) $row->importe_total;
		
		$sql = "SELECT CONCAT(organismo_area, ' (', organismo, ')') AS label, organismo_area_id AS model FROM salud1._organismos_areas INNER JOIN salud1._organismos USING(organismo_id) WHERE organismo_area_id='" . $row->organismo_area_id . "'";
		$rsAux = $this->mysqli->query($sql);
		$rowAux = $rsAux->fetch_object();
		$row->organismo_area = $rowAux->label;
		
		$sql = "SELECT CONCAT(organismo_area, ' (', organismo, ')') AS label, organismo_area_id AS model FROM salud1._organismos_areas INNER JOIN salud1._organismos USING(organismo_id) WHERE organismo_area_id='" . $row->organismo_area_id_origen . "'";
		$rsAux = $this->mysqli->query($sql);
		$rowAux = $rsAux->fetch_object();
		$row->organismo_area_origen = $rowAux->label;
	
		$resultado[] = $row;
	}

	return $resultado;
  }
  
  
  public function method_leer_operaciones($params, $error) {
  	$p = $params[0];
  	
	$sql = "SELECT json FROM viatico WHERE id_viatico=" . $p->id_viatico;
	$rs = $this->mysqli->query($sql);
	$row = $rs->fetch_object();
	return $row;
  }


  public function method_autocompletarVehiculo($params, $error) {
  	$p = $params[0];
  	
	$sql = "SELECT CONCAT(NRO_PAT, '  ', MARCA) AS label, COD_VEHICULO AS model FROM `017`.vehiculos WHERE NRO_PAT LIKE '%" . $p->texto . "%' ORDER BY label";
	return $this->toJson($this->mysqli->query($sql));
  }
  
  
  public function method_autocompletarLocalidad($params, $error) {
  	$p = $params[0];
  	//$rs = $this->mysqli->query("SELECT localidad_id AS id, CONCAT(localidad, ' (', departamento, ')') AS descrip FROM salud1._localidades INNER JOIN salud1._departamentos USING(departamento_id) WHERE " . (($_REQUEST['id']==null) ? "localidad LIKE '%" . $_REQUEST['descrip'] . "%'" : "localidad_id=" . $_REQUEST['id']));
	$sql = "SELECT CONCAT(localidad, ' (', departamento, ')') AS label, localidad_id AS model FROM salud1._localidades INNER JOIN salud1._departamentos USING(departamento_id) WHERE localidad LIKE '%" . $p->texto . "%' ORDER BY label";
	return $this->toJson($sql);
  }


  public function method_autocompletarCtaCte($params, $error) {
  	$p = $params[0];
	$sql = "SELECT descrip AS label, id_cta_cte AS model FROM cta_cte WHERE descrip LIKE '%" . $p->texto . "%' ORDER BY label";
	return $this->toJson($sql);
  }
  
  
  public function method_autocompletarMotivo($params, $error) {
  	$p = $params[0];
	$sql = "SELECT descrip AS label, id_motivo AS model FROM motivo WHERE descrip LIKE '%" . $p->texto . "%' ORDER BY label";
	return $this->toJson($sql);
  }
  

  public function method_autocompletarPersonal($params, $error) {
  	$p = $params[0];
  	set_time_limit(120);
  	
  	$opciones = array("funcionario"=>"bool", "eximir_tope_viatico"=>"bool");
  	
  	if (is_numeric($p->texto)) {
		$sql = "SELECT CONCAT(dni, ' (', TRIM(apenom), ')') AS label, id_personal AS model, codigo_002, funcionario, eximir_tope_viatico FROM salud1._personal WHERE NOT ISNULL(dni) AND NOT ISNULL(apenom) AND dni LIKE '" . $p->texto . "%' ORDER BY label";
  	} else {
  		$sql = "SELECT CONCAT(TRIM(apenom), ' (', dni, ')') AS label, id_personal AS model, codigo_002, funcionario, eximir_tope_viatico FROM salud1._personal WHERE NOT ISNULL(dni) AND NOT ISNULL(apenom) AND apenom LIKE '%" . $p->texto . "%' ORDER BY label";
  	}
	return $this->toJson($sql, $opciones);
  }
  
  
  public function method_autocompletarFuncionario($params, $error) {
  	$p = $params[0];
  	set_time_limit(120);
  	
  	$opciones = array("funcionario"=>"bool");
  	
  	if (is_numeric($p->texto)) {
  		$sql = "SELECT CONCAT(dni, ' (', TRIM(apenom), ')') AS label, id_personal AS model, codigo_002, funcionario FROM salud1._personal WHERE dni LIKE '" . $p->texto . "%' AND funcionario ORDER BY label";
  	} else {
  		$sql = "SELECT CONCAT(TRIM(apenom), ' (', dni, ')') AS label, id_personal AS model, codigo_002, funcionario FROM salud1._personal WHERE apenom LIKE '%" . $p->texto . "%' AND funcionario ORDER BY label";
  	}
	
	return $this->toJson($sql, $opciones);
  }
  
  
  public function method_autocompletarOrganismoArea($params, $error) {
  	$p = $params[0];
	$sql = "SELECT CONCAT(organismo_area, ' (', organismo, ')') AS label, organismo_area_id AS model FROM salud1._organismos_areas INNER JOIN salud1._organismos USING(organismo_id) WHERE organismo_area_estado='1' AND organismo_area LIKE '%" . $p->texto . "%' ORDER BY label";
	return $this->toJson($sql);
  }
  
  
  public function method_alta_modifica_viatico($params, $error) {
  	$p = $params[0];
  	
	if ($p->model->con_funcionario && $p->model->estado=="E") {
		$sql = "UPDATE salud1._personal SET codigo_002='" . $p->model->codigo_002fun . "' WHERE id_personal = '" . $p->model->id_funcionario . "'";
		$this->mysqli->query($sql);
	} else {
		$p->model->id_funcionario = null;
	}
	
	if ($p->model->estado=="E") {
		$sql = "UPDATE salud1._personal SET codigo_002='" . $p->model->codigo_002per . "' WHERE id_personal = '" . $p->model->id_personal . "'";
		$this->mysqli->query($sql);
	}
	
	$set = $this->prepararCampos($p->model, "viatico");
	$id_viatico = $p->model->id_viatico;
	if ($id_viatico=="0") {
		$sql = "INSERT viatico SET " . $set . ", fecha_tramite=NOW()";
		$this->mysqli->query($sql);
		$id_viatico = $this->mysqli->insert_id;
		if ($p->model->tipo_viatico=="A") {
			$sql = "UPDATE paramet SET nro_viatico='" . $p->model->nro_viatico . "' WHERE id_paramet = 1";
			$this->mysqli->query($sql);
		}
	} else {
		if ($p->model->estado=="E") {
			$sql="DELETE FROM viatico_localidad WHERE id_viatico='" . $id_viatico . "'";
			$this->mysqli->query($sql);
		}
		
		$sql = "UPDATE viatico SET " . $set . " WHERE id_viatico='" . $id_viatico . "'";
		$this->mysqli->query($sql);
	}
	
	if ($p->model->estado=="E") {
		foreach ($p->localidad as $item) {
			$sql = "INSERT viatico_localidad SET id_viatico='" . $id_viatico . "', localidad_id='" . $item . "'";
			$this->mysqli->query($sql);
		}
	}
	
	return $id_viatico;
  }
  
  
  public function method_leer_cta_cte($params, $error) {
	$sql = "SELECT * FROM cta_cte ORDER BY descrip";
	return $this->toJson($sql);
  }
  
  
  public function method_leer_motivos($params, $error) {
  	$p = $params[0];

	$sql = "SELECT * FROM motivo ORDER BY descrip";
	return $this->toJson($sql);
  }
  
  
  public function method_escribir_motivo($params, $error) {
  	$p = $params[0];
  	
  	$cambios = $p->cambios;
  	
	$this->mysqli->query("START TRANSACTION");
	
	foreach ($cambios->altas as $item) {
		$sql="INSERT INTO motivo SET descrip='" . $item->descrip . "'";
		$this->mysqli->query($sql);
		if ($this->mysqli->errno) break;
	}
	if (! $this->mysqli->errno) {
		foreach ($cambios->modificados as $item) {
			$sql="UPDATE motivo SET descrip='" . $item->descrip . "' WHERE id_motivo='" . $item->id_motivo . "'";
			$this->mysqli->query($sql);
			if ($this->mysqli->errno) break;
		}	
	}
	if ($this->mysqli->errno) {
		$this->mysqli->query("ROLLBACK");
		return $this->mysqli->error;
	} else {
		$this->mysqli->query("COMMIT");
	}
  }

  
  public function method_leer_paramet($params, $error) {
  	$p = $params[0];

	$sql = "SELECT * FROM paramet";
	$resultado = $this->toJson($sql);
	foreach($resultado[0] as $key => $value) {
		$resultado[0]->$key = (float) $value;
	}
	
	return $resultado;
  }
  
  
  public function method_escribir_paramet($params, $error) {
  	$p = $params[0];

	$set = $this->prepararCampos($p);
	$sql = "UPDATE paramet SET " . $set . " WHERE id_paramet=1";
	$this->mysqli->query($sql);
  }
  
  
  public function method_escribir_cta_cte($params, $error) {
  	$p = $params[0];
  	
  	$cambios = $p->cambios;
  	
  	try {
		$this->mysqli->query("START TRANSACTION");
		
		foreach ($cambios->altas as $item) {
			$sql="INSERT INTO cta_cte SET descrip='" . $item->descrip . "'";
			$this->mysqli->query($sql);
		}
	
		foreach ($cambios->modificados as $item) {
			$sql="UPDATE cta_cte SET descrip='" . $item->descrip . "' WHERE id_cta_cte='" . $item->id_cta_cte . "'";
			$this->mysqli->query($sql);
		}	
	
		$this->mysqli->query("COMMIT");
	
	} catch (Exception $e) {
		$this->mysqli->query("ROLLBACK");
	}
  }
  
  public function method_leer_personal($params, $error) {
  	$p = $params[0];
  	
  	$opciones = array("codigo_002"=>"float", "funcionario"=>"bool", "eximir_tope_viatico"=>"bool");
  	
	$sql = "SELECT id_personal, CONCAT(TRIM(apenom), ' (', dni, ')') AS descrip, codigo_002, funcionario, eximir_tope_viatico FROM salud1._personal WHERE apenom LIKE '%" . $p->descrip . "%' ORDER BY descrip";
	return $this->toJson($sql, $opciones);
  }
  
  
  public function method_escribir_personal($params, $error) {
  	$p = $params[0];
  	
	$sql = "UPDATE salud1._personal SET codigo_002=" . $p->codigo_002 . ", funcionario=" . (($p->funcionario) ? "TRUE" : "FALSE") . ", eximir_tope_viatico=" . (($p->eximir_tope_viatico) ? "TRUE" : "FALSE") . " WHERE id_personal=" . $p->id_personal;
	$this->mysqli->query($sql);
  }
  
  public function method_leer_titulares($params, $error) {
  	$p = $params[0];
  	
  	$resultado = array();
  	
	$sql = "SELECT CONCAT(TRIM(apenom), ' (', dni, ')') AS label FROM viatico INNER JOIN salud1._personal USING(id_personal) WHERE documentacion_id='" . $p . "' ORDER BY apenom";
	$rs = $this->mysqli->query($sql);
	while ($row = $rs->fetch_object()) {
		$resultado[] = $row->label;
	}
	
	return $resultado;
  }
}

?>

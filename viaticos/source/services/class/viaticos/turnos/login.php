<?php
class class_login
{
	private $_db;
	private $_perfil_id;
	private $_version;
	function __construct()
	{
		$this->config();
	}
	
	private function config()
	{
		require_once("conexion.php");
//		require_once("conexsalud1.php");
		require_once("DataBase.php");
		$this->_version = $VERSION;
		$this->_db = new DataBase($servidor,$usuario,$password,$base);
		$this->_db->conexion->query("SET NAMES utf8");
		$this->_perfil_id = '037001';
	}
	
	public function method_Login($params, $error)
    {
    	/*
		$this->_db->setQuery("
		SELECT sistemas_perfiles_usuarios_oas.id_sist_perfil_usuario_oas as value, 
		_organismos_areas.organismo_area_id,
		CONCAT(_organismos_areas.organismo_area, ' - ', _servicios.denominacion) as label
		FROM sistemas_perfiles_usuarios_oas
		INNER JOIN _sistemas_perfiles ON sistemas_perfiles_usuarios_oas.perfil_id = _sistemas_perfiles.perfil_id AND _sistemas_perfiles.perfil_id = '" . $this->_perfil_id . "'
		INNER JOIN _sistemas_usuarios ON sistemas_perfiles_usuarios_oas.id_sistema_usuario = _sistemas_usuarios.id_sistema_usuario
		INNER JOIN oas_usuarios ON sistemas_perfiles_usuarios_oas.id_oas_usuario = oas_usuarios.id_oas_usuario
		INNER JOIN _usuarios ON _sistemas_usuarios.SYSusuario = _usuarios.SYSusuario AND oas_usuarios.SYSusuario = _usuarios.SYSusuario AND _usuarios.SYSusuario = '" . $params[0]->usuario . "' AND _usuarios.SYSpassword = '" . md5($params[0]->password) . "'
		INNER JOIN _organismos_areas_servicios ON oas_usuarios.id_organismo_area_servicio = _organismos_areas_servicios.id_organismo_area_servicio
		INNER JOIN _organismos_areas ON _organismos_areas_servicios.id_organismo_area = _organismos_areas.organismo_area_id
		INNER JOIN _servicios ON _organismos_areas_servicios.id_servicio = _servicios.id_servicio
		ORDER BY label
		");
		*/
		
		$this->_db->setQuery("
		SELECT sistemas_perfiles_usuarios_oas.id_sist_perfil_usuario_oas as value, 
		_organismos_areas.organismo_area_id,
		CONCAT(_organismos_areas.organismo_area, ' - ', _servicios.denominacion) as label,
		sistemas_perfiles_usuarios_oas.perfil_id
		FROM sistemas_perfiles_usuarios_oas
		INNER JOIN _sistemas_usuarios ON sistemas_perfiles_usuarios_oas.id_sistema_usuario = _sistemas_usuarios.id_sistema_usuario
		INNER JOIN oas_usuarios ON sistemas_perfiles_usuarios_oas.id_oas_usuario = oas_usuarios.id_oas_usuario
		INNER JOIN _usuarios ON _sistemas_usuarios.SYSusuario = _usuarios.SYSusuario AND oas_usuarios.SYSusuario = _usuarios.SYSusuario AND _usuarios.SYSusuario = '" . $params[0]->usuario . "' AND _usuarios.SYSpassword = '" . md5($params[0]->password) . "'
		INNER JOIN _organismos_areas_servicios ON oas_usuarios.id_organismo_area_servicio = _organismos_areas_servicios.id_organismo_area_servicio
		INNER JOIN _organismos_areas ON _organismos_areas_servicios.id_organismo_area = _organismos_areas.organismo_area_id
		INNER JOIN _servicios ON _organismos_areas_servicios.id_servicio = _servicios.id_servicio
		ORDER BY label
		");
        $this->_db->alter();
        if ($this->_db->conexion->error) { $error->SetError(JsonRpcError_Unknown, $this->_db->conexion->error); return $error; }
		
        $result = new stdClass;
        $result->servicios = $this->_db->loadResult();

        $aux = array();
        foreach ($result->servicios as $item) {
			if (is_null($aux[$item->organismo_area_id])) {
				$item->perfiles = array();
				$item->perfiles[$item->perfil_id] = true;
				$aux[$item->organismo_area_id] = $item;
			} else {
				$aux[$item->organismo_area_id]->perfiles[$item->perfil_id] = true;
			}
        }
        $result->servicios = array();
        foreach ($aux as $item) {
			$result->servicios[] = $item;
        }

        
        if (count($result->servicios) >= 1)
        {
        	$result->login = true;
        	return $result;			
        }
        else
        {
        	$result->login = false;
        	return $result;
        }
    }
    
	public function method_Ingresar($params, $error) {
		$_SESSION['id_sist_perfil_usuario_oas'] = $params[0]->servicio;
		$_SESSION['usuario'] = $params[0]->usuario;
		$_SESSION['organismo_area'] = $params[0]->organismo_area;
	}
    
	function method_Logout()
    {
       	$_SESSION['id_sist_perfil_usuario_oas'] = null;
       	$_SESSION['usuario'] = null;
    }
	
	function method_Logueado($params, $error)
    {
    	if ($this->_version != $params[0]->version) { $error->SetError(JsonRpcError_Unknown, "\nUd. se encuentra ejecutando una version anterior del Software. Por favor, presione 2 veces seguidas la tecla F5 para cargar la nueva version."); return $error; }
    	
        if ($_SESSION['usuario'])
        {
        	$p = new stdClass;
        	$p->usuario = $_SESSION['usuario'];
        	$p->organismo_area = $_SESSION['organismo_area'];
			return $p;
        }
        else
        {
        	return false;
        }
    }
        
	function method_set_password($params, $error)
    {
    	$this->_db->setQuery("UPDATE _usuarios SET SYSpassword = '" . md5($params[0]->password) . "' WHERE SYSusuario = '" . $_SESSION['usuario'] . "' AND SYSpassword = '" . md5($params[0]->actual) . "' LIMIT 1");
    	$this->_db->alter();
    	if ($this->_db->conexion->affected_rows > 0)
    	{
    		return true;
    	}
    	else
    	{
    		return false;
    	}
    }
    
    function method_getDatosUsuario($params, $error)
    {
    	$this->_db->setQuery("
    	SELECT DISTINCT _usuarios.SYSusuario, 
    	persona_nombre as SYSusuarionombre 
    	FROM _usuarios
    	INNER JOIN _personas ON _usuarios.id_persona = _personas.persona_id 
    	WHERE _usuarios.SYSusuario = '" . $_SESSION['usuario'] . "' 
    	AND persona_nombre != ''
    	");
    	$this->_db->alter();
    	return $this->_db->loadResult();
    }
}
?>
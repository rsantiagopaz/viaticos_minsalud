<?php
class DataBase {
	public $conexion;
	private $resour;
	private $sql;
	public static $queries;

	public function __construct($server, $user, $password, $dbName){
		$this->conexion = new mysqli("$server", "$user", "$password", "$dbName");
		//$this->queries = 0;
		self::$queries = 0;
		$this->resour = null;
	}

	public function execute(){
		if(!($this->resour = $this->conexion->query($this->sql))){
			return null;
		}
		//$this->queries++;
		self::$queries++;
		return $this->resour;
	}

	public function alter(){
		if(!($this->resour = $this->conexion->query($this->sql))){
			return false;
		}
		return true;
	}

	public function loadResult(){
		if (!($cur = $this->execute())){
			return null;
		}
		$array = array();
		while ($row = $cur->fetch_object()){
			$array[] = $row;
		}
		return $array;
	}

	public function setQuery($sql){
		if(empty($sql)){
			return false;
		}
		$this->sql = $sql;
		return true;
	}

	public function freeResults(){
		$this->resour->free();
		return true;
	}

	public function loadObject(){
		if ($cur = $this->execute()){
			if ($object = $cur->fetch_object()){
				$cur->free();
				return $object;
			}
			else {
				return null;
			}
		}
		else {
			return false;
		}
	}

	function __destruct(){
		//$this->resour->free();
		$this->conexion->close();
	}
}
?>

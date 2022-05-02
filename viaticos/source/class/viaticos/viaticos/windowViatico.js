qx.Class.define("viaticos.viaticos.windowViatico",
{
	extend : componente.comp.ui.ramon.window.Window,
	construct : function (appMain, id_viatico, tipo_viatico, estado)
	{
	this.base(arguments);
	
	this.set({
		width: 900,
		height: 600,
		showMinimize: false,
		showMaximize: false
	});
	
	this.setLayout(new qx.ui.layout.Canvas());
	this.setResizable(false, false, false, false);

	this.addListenerOnce("appear", function(e){
		if (estado == "L") slbCtaCte.focus(); else txtAsunto.focus();
	});


	var json;
	var options;
	var organismo_area_id;
	var modelForm = null;
	var boolAlta = true;
	var regexpHora = new RegExp(/^((0[0-9]|1\d|2[0-3]|[0-9])(:|.)([0-5]\d)){1}$/);
	var numberformatCantDias = new qx.util.format.NumberFormat("en").set({groupingUsed: false, maximumFractionDigits: 0});
	var numberformatMonto = new qx.util.format.NumberFormat("en").set({groupingUsed: false, maximumFractionDigits: 2, minimumFractionDigits: 2});
	var numberformatMontoEs = new qx.util.format.NumberFormat("es").set({groupingUsed: false, maximumFractionDigits: 2, minimumFractionDigits: 2});
	var contexto = this;
	var strTopeMensual = "";
	var validar_tope = true;
	var ultimo_id_viatico = 0;
	
	
	var calcularDias = function() {
		if (dtfFechadesde.getValue()!=null && txtHoradesde.getValue()!="" && dtfFechahasta.getValue()!=null && txtHorahasta.getValue()!="" && dtfFechahasta.getValue() - dtfFechadesde.getValue() >= 0) {
			var dias, horas, resto;
			var fechadesde = dtfFechadesde.getValue();
			var fechahasta = dtfFechahasta.getValue();
			
			if (chkFueraprovincia.getValue()) {
				horas = parseInt((fechahasta - fechadesde) / 3600000);
				dias = parseInt(horas / 24);
				
				fechahasta.setHours(parseFloat(txtHorahasta.getValue().substr(0, 2)));
				fechahasta.setMinutes(parseFloat(txtHorahasta.getValue().substr(3, 2)));
				fechadesde = new Date(fechahasta.getFullYear(), fechahasta.getMonth(), fechahasta.getDate(), 6, 30);
				
				resto = parseInt((fechahasta - fechadesde) / 3600000);
				/*
				if (fechahasta.getHours() >= 6 && fechahasta.getMinutes() >= 30) {
					resto = parseInt((fechahasta - fechadesde) / 3600000);
				} else if (dias > 0) {
					resto = 0;
				}
				*/

				txtMontoDiarioViatico.setValue(json.paramet.diario_fp);
				
				if (resto >= 16) {
					txtAdicionalViatico.setValue(json.paramet.diario_34_fp);
				} else if (resto >= 11) {
					txtAdicionalViatico.setValue(json.paramet.diario_12_fp);
				}
			} else {
				fechadesde.setHours(parseFloat(txtHoradesde.getValue().substr(0, 2)));
				fechadesde.setMinutes(parseFloat(txtHoradesde.getValue().substr(3, 2)));
				
				fechahasta.setHours(parseFloat(txtHorahasta.getValue().substr(0, 2)));
				fechahasta.setMinutes(parseFloat(txtHorahasta.getValue().substr(3, 2)));
				
				horas = parseInt((fechahasta - fechadesde) / 3600000);
				dias = parseInt(horas / 22);
				resto = horas - (dias * 22);
				
				txtMontoDiarioViatico.setValue(json.paramet.diario_dp);

				if (resto >= 16) {
					txtAdicionalViatico.setValue(json.paramet.diario_34_dp);
				} else if (resto >= 11) {
					txtAdicionalViatico.setValue(json.paramet.diario_12_dp);
				}
			}

			if (resto >= 16) {
				lblAdicionallbl.setValue("Adic.3/4:")
			} else if (resto >= 11) {
				lblAdicionallbl.setValue("Adic.1/2:")
			} else {
				lblAdicionallbl.setValue("Adic.:")
				txtAdicionalViatico.setValue(0);
			}
			
			
			if (!lstPersonal.isSelectionEmpty() && lstPersonal.getSelection()[0].getUserData("datos").funcionario) {
				txtMontoDiarioViatico.setValue(txtCodigo_002per.getValue() * 4.5 / 100);
				txtMontoDiarioAlojam.setValue(((chkFueraprovincia.getValue()) ? json.paramet.alojam_func_fp : json.paramet.alojam_func_dp));
				if (resto >= 16) {
					txtAdicionalViatico.setValue(txtMontoDiarioViatico.getValue() * 75 / 100);
				} else if (resto >= 11) {
					txtAdicionalViatico.setValue(txtMontoDiarioViatico.getValue() * 50 / 100);
				}
			} else {
				if (chkConfuncionario.getValue()) {
					txtMontoDiarioAlojam.setValue((chkFueraprovincia.getValue()) ? json.paramet.alojam_func_fp : json.paramet.alojam_func_dp);
				} else {
					txtMontoDiarioAlojam.setValue((chkFueraprovincia.getValue()) ? json.paramet.alojam_emp_fp : slbAloj_emp.getModelSelection().getItem(0));
				}
			}
			
			if (chkConfuncionario.getValue()) {
				txtMontoDiarioViatico.setValue(txtCodigo_002fun.getValue() * json.paramet.porc_func / 100);
				if (resto >= 16) {
					txtAdicionalViatico.setValue(txtMontoDiarioViatico.getValue() * 75 / 100);
				} else if (resto >= 11) {
					txtAdicionalViatico.setValue(txtMontoDiarioViatico.getValue() * 50 / 100);
				}
			}
		} else dias = 0;
		
		if (dias < 0) dias = 0; 
		
		txtCantDiasViatico.setValue(dias);
	}
	
	var sumar = function() {
		txtSubtotalViatico.setValue(txtCantDiasViatico.getValue() * txtMontoDiarioViatico.getValue() + txtAdicionalViatico.getValue());
		txtSubtotalAlojam.setValue(txtCantDiasAlojam.getValue() * txtMontoDiarioAlojam.getValue());
		txtImporteTotal.setValue(txtSubtotalViatico.getValue() + txtSubtotalAlojam.getValue() + txtCombustible.getValue() + txtPasajes.getValue() + txtOtrosgastos.getValue());
		lblTotal.setValue("Total: " + numberformatMontoEs.format(txtImporteTotal.getValue()));
	}
	
	var leer_titulares = function(p) {
		var rpc = new componente.comp.io.ramon.rpc.Rpc("services/", "viaticos.Viaticos");
		rpc.callAsync(function(resultado, error, id){
			lstLista.setModel(qx.data.marshal.Json.createModel(resultado));
		}, "leer_titulares", p);
	}
	
	
	var form = new qx.ui.form.Form();
	
	var txtAsunto = new qx.ui.form.TextField("");
	txtAsunto.setRequired(true);
	txtAsunto.addListener("changeValue", function(e){
		leer_titulares(e.getData().trim());
	});
	txtAsunto.addListener("blur", function(e){
		txtAsunto.setValue(txtAsunto.getValue().trim());
	});
	form.add(txtAsunto, "Asunto", null, "documentacion_id", null, {enabled: estado != "L", grupo: 1, item: {row: 0, column: 1, colSpan: 4}});
	
	
	
	var txtDummy2 = new qx.ui.form.TextField();
	txtDummy2.setVisibility("hidden");
	form.add(txtDummy2, "", null, "dummy2", null, {enabled: false, grupo: 1, item: {row: 1, column: 1, colSpan: 13}});
	/*
	var cboOrganismoArea = new componente.comp.ui.ramon.combobox.ComboBoxAuto({url: "services/", serviceName: "viaticos.Viaticos", methodName: "autocompletarOrganismoArea"});
	cboOrganismoArea.setRequired(true);
	form.add(cboOrganismoArea, "Org/Area", function(value) {
		if (lstOrganismoArea.isSelectionEmpty()) throw new qx.core.ValidationError("Validation Error", "Debe seleccionar Organismo/Area");
	}, "cboOrganismoArea", null, {enabled: estado!="L", grupo: 1, item: {row: 1, column: 1, colSpan: 13}});
	var lstOrganismoArea = cboOrganismoArea.getChildControl("list");
	form.add(lstOrganismoArea, "", null, "organismo_area_id");
	*/
	
	
	
	var cboOrganismoAreaOrigen = new componente.comp.ui.ramon.combobox.ComboBoxAuto({url: "services/", serviceName: "viaticos.Viaticos", methodName: "autocompletarOrganismoArea"});
	cboOrganismoAreaOrigen.setRequired(true);
	form.add(cboOrganismoAreaOrigen, "Org/Area origen", function(value) {
		if (lstOrganismoAreaOrigen.isSelectionEmpty()) throw new qx.core.ValidationError("Validation Error", "Debe seleccionar Org/Area origen");
	}, "cboOrganismoAreaOrigen", null, {enabled: estado!="L", grupo: 1, item: {row: 2, column: 1, colSpan: 13}});
	var lstOrganismoAreaOrigen = cboOrganismoAreaOrigen.getChildControl("list");
	form.add(lstOrganismoAreaOrigen, "", null, "organismo_area_id_origen");
	
	
	
	var cboPersonal = new componente.comp.ui.ramon.combobox.ComboBoxAuto({url: "services/", serviceName: "viaticos.Viaticos", methodName: "autocompletarPersonal"});
	cboPersonal.setRequired(true);
	form.add(cboPersonal, "Titular", function(value) {
		if (lstPersonal.isSelectionEmpty()) throw new qx.core.ValidationError("Validation Error", "Debe seleccionar el titular");
		else if (txtCodigo_002per.getValue() <= 0) throw new qx.core.ValidationError("Validation Error", "Debe asignarse Código 002 del titular");
	}, "cboPersonal", null, {enabled: estado!="L", grupo: 1, item: {row: 3, column: 1, colSpan: 13}});
	var lstPersonal = cboPersonal.getChildControl("list");
	lstPersonal.addListener("changeSelection", function(e) {
		var data = e.getData();
		txtCodigo_002per.setValue((data.length == 0) ? 0 : parseFloat(data[0].getUserData("datos").codigo_002));
		validar_tope = true;
	});
	form.add(lstPersonal, "", null, "id_personal");
	
	
	var txtCodigo_002per = new qx.ui.form.Spinner(0, 0, 100000);
	txtCodigo_002per.getChildControl("upbutton").setVisibility("excluded");
	txtCodigo_002per.getChildControl("downbutton").setVisibility("excluded");
	txtCodigo_002per.setSingleStep(0);
	txtCodigo_002per.setPageStep(0);
	txtCodigo_002per.setNumberFormat(numberformatMonto);
	txtCodigo_002per.addListener("changeValue", function(e) {
		calcularDias();
		sumar();
	});
	//form.add(txtCodigo_002per, "Cód.002", qx.util.Validate.range(1, 100000, "Debe ingresar Código 002 del titular"), "codigo_002per", null, {enabled: estado!="L", grupo: 1, item: {row: 4, column: 1, colSpan: 3}});
	form.add(txtCodigo_002per, "Cód.002", null, "codigo_002per", null, {enabled: false, grupo: 1, item: {row: 4, column: 1, colSpan: 3}});

	
	
	var cboMotivo = new componente.comp.ui.ramon.combobox.ComboBoxAuto({url: "services/", serviceName: "viaticos.Viaticos", methodName: "autocompletarMotivo"});
	cboMotivo.setRequired(true);
	form.add(cboMotivo, "Motivo", function(value) {
		if (lstMotivo.isSelectionEmpty()) throw new qx.core.ValidationError("Validation Error", "Debe seleccionar un motivo");
	}, "cboMotivo", null, {enabled: estado!="L", grupo: 1, item: {row: 5, column: 1, colSpan: 13}});
	var lstMotivo = cboMotivo.getChildControl("list");
	form.add(lstMotivo, "", null, "id_motivo");
	

	var lstLocalidad = new qx.ui.form.List();
	lstLocalidad.setRequired(true);
	lstLocalidad.setRequiredInvalidMessage("Debe agregar localidad/es");
	form.add(lstLocalidad, "", null, "lstLocalidad");



	var dtfFechadesde = new qx.ui.form.DateField();
	dtfFechadesde.setValue(new Date());
	dtfFechadesde.setSelectable(true);
	dtfFechadesde.setRequired(true);
	dtfFechadesde.addListener("changeValue", function(e) {
		calcularDias();
		sumar();
	});
	form.add(dtfFechadesde, "Fecha desde", null, "fecha_desde1", null, {enabled: estado!="L", grupo: 1, item: {row: 6, column: 1, colSpan: 4}});
	
	var txtHoradesde = new qx.ui.form.TextField("00:00");
	txtHoradesde.setRequired(true);
	txtHoradesde.setPlaceholder("00:00");
	txtHoradesde.addListener("changeValue", function(e) {
		calcularDias();
		sumar();
	});
	txtHoradesde.addListener("blur", function(e){
		var value = txtHoradesde.getValue();
		if (regexpHora.test(value)) {
			value = qx.lang.String.pad(value, 5, "0");
			value = value.replace(".", ":");
			value = value.replace(" ", ":");
		} else {
			value = "";
		}
		txtHoradesde.setValue(value);
	});

	form.add(txtHoradesde, "Hora desde", null, "hora_desde1", null, {enabled: estado!="L", grupo: 1, item: {row: 6, column: 9, colSpan: 2}, label: {row: 6, column: 6, colSpan: 3}});

	var dtfFechahasta = new qx.ui.form.DateField(new Date());
	dtfFechahasta.setValue(new Date());
	dtfFechahasta.setSelectable(true);
	dtfFechahasta.setRequired(true);
	dtfFechahasta.addListener("changeValue", function(e) {
		calcularDias();
	});
	form.add(dtfFechahasta, "Fecha hasta", null, "fecha_hasta1", null, {enabled: estado!="L", grupo: 1, item: {row: 7, column: 1, colSpan: 4}});
	
	var txtHorahasta = new qx.ui.form.TextField("00:00");
	txtHorahasta.setRequired(true);
	txtHorahasta.setPlaceholder("00:00");
	txtHorahasta.addListener("changeValue", function(e) {
		calcularDias();
		sumar();
	});
	txtHorahasta.addListener("blur", function(e){
		var value = txtHorahasta.getValue();
		if (regexpHora.test(value)) {
			value = qx.lang.String.pad(value, 5, "0");
			value = value.replace(".", ":");
			value = value.replace(" ", ":");
		} else {
			value = "";
		}
		txtHorahasta.setValue(value);
	});
	form.add(txtHorahasta, "Hora hasta", null, "hora_hasta1", null, {enabled: estado!="L", grupo: 1, item: {row: 7, column: 9, colSpan: 2}, label: {row: 7, column: 6, colSpan: 3}});
	
	var txtDummy = new qx.ui.form.TextField();
	txtDummy.setVisibility("hidden");
	form.add(txtDummy, "", null, "dummy", null, {enabled: false, grupo: 1, item: {row: 8, column: 1, colSpan: 5}});
	
	var chkFueraprovincia = new qx.ui.form.CheckBox("Fuera de provincia");
	chkFueraprovincia.addListener("changeValue", function(e) {
		calcularDias();
		sumar();
	});
	form.add(chkFueraprovincia, "", null, "fuera_provincia", null, {enabled: estado!="L", tabIndex: 15, grupo: 1, item: {row: 9, column: 1, colSpan: 5}});
	
	var slbAloj_emp = new qx.ui.form.SelectBox();
	var slbAloj_emp_item1 = new qx.ui.form.ListItem("0", null, 0);
	var slbAloj_emp_item2 = new qx.ui.form.ListItem("0", null, 0);
	slbAloj_emp.add(slbAloj_emp_item1);
	slbAloj_emp.add(slbAloj_emp_item2);
	slbAloj_emp.addListener("changeSelection", function(e){
		calcularDias();
		sumar();
	});
	form.add(slbAloj_emp, "Aloj.emp.", null, "aloj_emp", null, {enabled: estado!="L", tabIndex: 16, grupo: 1, item: {row: 9, column: 8, colSpan: 3}});
	
	var txtCantDiasViatico = new qx.ui.form.Spinner(0, 0, 1000);
	txtCantDiasViatico.setNumberFormat(numberformatCantDias);
	txtCantDiasViatico.addListener("changeValue", sumar);
	form.add(txtCantDiasViatico, "Cant.dias viat.", null, "cant_dias_viatico1", null, {enabled: estado!="L", grupo: 1, item: {row: 10, column: 1, colSpan: 2}});
	
	var txtMontoDiarioViatico = new qx.ui.form.Spinner(0, 0, 100000);
	txtMontoDiarioViatico.getChildControl("upbutton").setVisibility("excluded");
	txtMontoDiarioViatico.getChildControl("downbutton").setVisibility("excluded");
	txtMontoDiarioViatico.setSingleStep(0);
	txtMontoDiarioViatico.setPageStep(0);
	txtMontoDiarioViatico.setNumberFormat(numberformatMonto);
	txtMontoDiarioViatico.setWidth(60);
	txtMontoDiarioViatico.setEnabled(estado!="L");
	txtMontoDiarioViatico.addListener("changeValue", function(e){
		lblDiarioViatico.setValue("* " + numberformatMontoEs.format(txtMontoDiarioViatico.getValue()));
		sumar();
	});
	form.add(txtMontoDiarioViatico, "M.diario", null, "monto_diario_viatico");
	
	var txtAdicionalViatico = new qx.ui.form.Spinner(0, 0, 100000);
	txtAdicionalViatico.getChildControl("upbutton").setVisibility("excluded");
	txtAdicionalViatico.getChildControl("downbutton").setVisibility("excluded");
	txtAdicionalViatico.setSingleStep(0);
	txtAdicionalViatico.setPageStep(0);
	txtAdicionalViatico.setWidth(60);
	txtAdicionalViatico.setEnabled(estado!="L");
	txtAdicionalViatico.setNumberFormat(numberformatMonto);
	txtAdicionalViatico.addListener("changeValue", function(e){
		lblAdicional.setValue(numberformatMontoEs.format(txtAdicionalViatico.getValue()));
		sumar();
	});
	form.add(txtAdicionalViatico, "", null, "adicional_viatico1");
	
	var txtSubtotalViatico = new qx.ui.form.Spinner(0, 0, 100000);
	txtSubtotalViatico.addListener("changeValue", function(e){
		lblSubtotalViatico.setValue("Subt.: " + numberformatMontoEs.format(txtSubtotalViatico.getValue()));
	});
	form.add(txtSubtotalViatico, "Subtotal", null, "subtotal_viatico1");
	
	var txtCantDiasAlojam = new qx.ui.form.Spinner(0, 0, 1000);
	txtCantDiasAlojam.setNumberFormat(numberformatCantDias);
	txtCantDiasAlojam.addListener("changeValue", sumar);
	form.add(txtCantDiasAlojam, "Cant.dias alojam.", null, "cant_dias_alojam1", null, {enabled: estado!="L", grupo: 1, item: {row: 11, column: 1, colSpan: 2}});
	
	var txtMontoDiarioAlojam = new qx.ui.form.Spinner(0, 0, 100000);
	txtMontoDiarioAlojam.getChildControl("upbutton").setVisibility("excluded");
	txtMontoDiarioAlojam.getChildControl("downbutton").setVisibility("excluded");
	txtMontoDiarioAlojam.setSingleStep(0);
	txtMontoDiarioAlojam.setPageStep(0);
	txtMontoDiarioAlojam.setWidth(60);
	txtMontoDiarioAlojam.setNumberFormat(numberformatMonto);
	txtMontoDiarioAlojam.setEnabled(estado!="L");
	txtMontoDiarioAlojam.addListener("changeValue", function(e){
		lblDiarioAlojam.setValue("* " + numberformatMontoEs.format(txtMontoDiarioAlojam.getValue()));
		sumar();
	});
	form.add(txtMontoDiarioAlojam, "M.diario", null, "monto_diario_alojam");
	
	var txtSubtotalAlojam = new qx.ui.form.Spinner(0, 0, 100000);
	txtSubtotalAlojam.addListener("changeValue", function(e){
		lblSubtotalAlojam.setValue("Subt.: " + numberformatMontoEs.format(txtSubtotalAlojam.getValue()));
	});
	form.add(txtSubtotalAlojam, "Subtotal", null, "subtotal_alojam1");
	

	var txtImporteTotal = new qx.ui.form.Spinner(0, 0, 1000000);
	form.add(txtImporteTotal, "Imp.total", null, "importe_total");
	
	
	var slbTipo_transporte = new qx.ui.form.SelectBox();
	slbTipo_transporte.add(new qx.ui.form.ListItem("Oficial", null, "O")); 
	slbTipo_transporte.add(new qx.ui.form.ListItem("Público terrestre", null, "T"));
	slbTipo_transporte.add(new qx.ui.form.ListItem("Público aereo", null, "A"));
	slbTipo_transporte.addListener("changeSelection", function(e){
		if (e.getData()[0].getModel() == "O") {
			cboVehiculo.setEnabled(true);
		} else {
			cboVehiculo.setValue("");
			cboVehiculo.setEnabled(false);
		}
	});
	form.add(slbTipo_transporte, "Tipo transporte", null, "tipo_transporte", null, {enabled: estado!="L", grupo: 1, item: {row: 12, column: 1, colSpan: 5}});
	
	var cboVehiculo = new componente.comp.ui.ramon.combobox.ComboBoxAuto({url: "services/", serviceName: "viaticos.Viaticos", methodName: "autocompletarVehiculo"});
	form.add(cboVehiculo, "Vehiculo", function(value) {
		if (slbTipo_transporte.getModelSelection().getItem(0)=="O" && lstVehiculo.isSelectionEmpty()) throw new qx.core.ValidationError("Validation Error", "Debe seleccionar un vehículo oficial");
	}, "cboVehiculo", null, {enabled: estado!="L", grupo: 1, item: {row: 13, column: 1, colSpan: 10}});
	var lstVehiculo = cboVehiculo.getChildControl("list");
	form.add(lstVehiculo, "", null, "COD_VEHICULO");
	
	
	var txtCombustible = new qx.ui.form.Spinner(0, 0, 100000);
	txtCombustible.getChildControl("upbutton").setVisibility("excluded");
	txtCombustible.getChildControl("downbutton").setVisibility("excluded");
	txtCombustible.setSingleStep(0);
	txtCombustible.setPageStep(0);
	txtCombustible.setNumberFormat(numberformatMonto);
	txtCombustible.addListener("changeValue", sumar);
	form.add(txtCombustible, "Combustible", null, "combustible1", null, {enabled: estado!="L", grupo: 1, item: {row: 14, column: 1, colSpan: 3}});
	

	var txtPasajes = new qx.ui.form.Spinner(0, 0, 100000);
	txtPasajes.getChildControl("upbutton").setVisibility("excluded");
	txtPasajes.getChildControl("downbutton").setVisibility("excluded");
	txtPasajes.setSingleStep(0);
	txtPasajes.setPageStep(0);
	txtPasajes.setNumberFormat(numberformatMonto);
	txtPasajes.addListener("changeValue", sumar);
	form.add(txtPasajes, "Pasajes", null, "pasajes1", null, {enabled: estado!="L", grupo: 1, item: {row: 15, column: 1, colSpan: 3}});
	
	
	var txtOtrosgastos = new qx.ui.form.Spinner(0, 0, 100000);
	txtOtrosgastos.getChildControl("upbutton").setVisibility("excluded");
	txtOtrosgastos.getChildControl("downbutton").setVisibility("excluded");
	txtOtrosgastos.setSingleStep(0);
	txtOtrosgastos.setPageStep(0);
	txtOtrosgastos.setNumberFormat(numberformatMonto);
	txtOtrosgastos.addListener("changeValue", sumar);
	form.add(txtOtrosgastos, "Otros gastos", null, "otros_gastos1", null, {enabled: estado!="L", grupo: 1, item: {row: 16, column: 1, colSpan: 3}});
	

	var chkConfuncionario = new qx.ui.form.CheckBox("Con funcionario");
	chkConfuncionario.addListener("changeValue", function(e) {
		if (e.getData()&& estado!="L") {
			cboFuncionario.setEnabled(true);
			txtCodigo_002fun.setEnabled(false);
			//txtMontoDiarioAlojam.setValue((chkFueraprovincia.getValue()) ? paramet.alojam_func_fp : paramet.alojam_func_dp);
		} else {
			cboFuncionario.setValue("");
			cboFuncionario.setEnabled(false);
			txtCodigo_002fun.setValue(0);
			txtCodigo_002fun.setEnabled(false);
			//txtMontoDiarioAlojam.setValue((chkFueraprovincia.getValue()) ? paramet.alojam_emp_fp : paramet.alojam_emp_dp);
		}
		calcularDias();
		sumar();
	});
	form.add(chkConfuncionario, "", null, "con_funcionario", null, {enabled: estado!="L", grupo: 1, item: {row: 11, column: 16, colSpan: 5}});
	
	
	var cboFuncionario = new componente.comp.ui.ramon.combobox.ComboBoxAuto({url: "services/", serviceName: "viaticos.Viaticos", methodName: "autocompletarFuncionario"});
	form.add(cboFuncionario, "Funcionario", function(value) {
		if (chkConfuncionario.getValue() && lstFuncionario.isSelectionEmpty()) throw new qx.core.ValidationError("Validation Error", "Debe seleccionar un funcionario");
		else if (chkConfuncionario.getValue() && txtCodigo_002fun.getValue() <= 0) throw new qx.core.ValidationError("Validation Error", "Debe asignarse Código 002 del funcionario");
	}, "cboFuncionario", null, {enabled: false, grupo: 1, item: {row: 12, column: 16, colSpan: 13}});
	var lstFuncionario = cboFuncionario.getChildControl("list");
	lstFuncionario.addListener("changeSelection", function(e) {
		var data = e.getData();
		txtCodigo_002fun.setValue((data.length == 0) ? 0 : parseFloat(data[0].getUserData("datos").codigo_002));
	});
	form.add(lstFuncionario, "", null, "id_funcionario");
	
	var txtCodigo_002fun = new qx.ui.form.Spinner(0, 0, 100000);
	txtCodigo_002fun.getChildControl("upbutton").setVisibility("excluded");
	txtCodigo_002fun.getChildControl("downbutton").setVisibility("excluded");
	txtCodigo_002fun.setSingleStep(0);
	txtCodigo_002fun.setPageStep(0);
	txtCodigo_002fun.setNumberFormat(numberformatMonto);
	txtCodigo_002fun.addListener("changeValue", function(e) {
		calcularDias();
		sumar();
	});
	form.add(txtCodigo_002fun, "Cód.002", null, "codigo_002fun", null, {enabled: false, grupo: 1, item: {row: 13, column: 16, colSpan: 3}});

	

	var rpc = new componente.comp.io.ramon.rpc.Rpc("services/", "viaticos.Viaticos");
	try {
		var resultado = rpc.callSync("leer_cta_cte");
	} catch (ex) {
		alert("Sync exception: " + ex);
	}
	
	var slbCtaCte = new qx.ui.form.SelectBox();
	slbCtaCte.setRequired(true);
	for (var x in resultado) {
		slbCtaCte.add(new qx.ui.form.ListItem(resultado[x].descrip, null, resultado[x].id_cta_cte));
	}
	//options = {enabled: tipo_viatico=="R" || (tipo_viatico=="A" && estado=="L"), grupo: 1, item: {row: 13, column: 16, colSpan: 10}};
	options = {enabled: estado=="L", grupo: 1, item: {row: 14, column: 16, colSpan: 10}};
	form.add(slbCtaCte, "Cta.Cte.", null, "id_cta_cte", null, options);
	
	
	
	
/*	
	var cboCtaCte = new componente.comp.ui.ramon.combobox.ComboBoxAuto({url: "services/", serviceName: "viaticos.Viaticos", methodName: "autocompletarCtaCte"});
	cboCtaCte.setRequired(true);
	options = {enabled: tipo_viatico=="R" || (tipo_viatico=="A" && estado=="L"), grupo: 1, item: {row: 13, column: 13, colSpan: 10}};
	form.add(cboCtaCte, "Cta.Cte.", function(value) {
		if (lstCtaCte.isSelectionEmpty() && (tipo_viatico == "R" || estado=="L")) throw new qx.core.ValidationError("Validation Error", "Debe seleccionar cta.cte.");
	}, "cboCtaCte", null, options);
	var lstCtaCte = cboCtaCte.getChildControl("list");
	form.add(lstCtaCte, "", null, "id_cta_cte");
	
	*/
	
	
	
	
	var txtNroCheque = new qx.ui.form.Spinner(0, 0, 10000000000);
	txtNroCheque.getChildControl("upbutton").setVisibility("excluded");
	txtNroCheque.getChildControl("downbutton").setVisibility("excluded");
	txtNroCheque.setSingleStep(0);
	txtNroCheque.setPageStep(0);
	//options = {enabled: tipo_viatico=="R" || (tipo_viatico=="A" && estado=="L"), grupo: 1, item: {row: 14, column: 16, colSpan: 4}};
	options = {enabled: estado=="L", grupo: 1, item: {row: 15, column: 16, colSpan: 4}};
	form.add(txtNroCheque, "Nro.cheque", null, "nro_cheque", null, options);
	
	var dtfFechacheque = new qx.ui.form.DateField(new Date());
	//dtfFechacheque.setValue(new Date());
	dtfFechacheque.setSelectable(true);
	dtfFechacheque.setRequired(true);
	form.add(dtfFechacheque, "F. cheque", function(value) {
		//if (dtfFechacheque.getValue()==null && (tipo_viatico == "R" || estado=="L")) throw new qx.core.ValidationError("Validation Error", "Debe ingresar fecha del cheque");
		if (dtfFechacheque.getValue()==null && (estado=="L")) throw new qx.core.ValidationError("Validation Error", "Debe ingresar fecha del cheque");
	//}, "fecha_cheque", null, {enabled: tipo_viatico=="R" || (tipo_viatico=="A" && estado=="L"), grupo: 1, item: {row: 15, column: 16, colSpan: 4}});
	}, "fecha_cheque", null, {enabled: estado=="L", grupo: 1, item: {row: 16, column: 16, colSpan: 4}});
	

	

	//var formView = new qx.ui.form.renderer.Double(form);
	if (tipo_viatico == "A") {
		this.setCaption(" - Anticipo");
		var formView = new componente.comp.ui.ramon.abstractrenderer.Grid(form, 50, 50, 1);
	} else {
		this.setCaption(" - Reintegro");
		var formView = new componente.comp.ui.ramon.abstractrenderer.Grid(form, 50, 50);
	}
	
	var lblLinea = new qx.ui.basic.Label("<hr>");
	lblLinea.setRich(true);
	lblLinea.setWidth(870);
	//this.add(lblLinea, {left: 10, top: 224});
	
	this.add(formView, {left: 10, top: 0})
	
	var lblNroViatico = new qx.ui.basic.Label("");
	this.add(lblNroViatico, {left: 280, top: 4});
	

	var lblDiarioViatico = new qx.ui.basic.Label("");
	
	var lblDiarioAlojam = new qx.ui.basic.Label("");
	//this.add(lblDiarioAlojam, {left: 170, top: 315});

	//this.add(new qx.ui.basic.Label("*"), {left: 185, top: 279});
	
	//txtMontoDiarioViatico.getChildControl("textfield").bind("value", lblDiarioViatico, "value");
	
	var lblAdicional = new qx.ui.basic.Label("0,00");
	
	var lblAdicionallbl = new qx.ui.basic.Label("Adic.:");
	this.add(lblAdicionallbl, {left: 240, top: 287});
	
	if (tipo_viatico=="R") {
		this.add(new qx.ui.basic.Label("*"), {left: 162, top: 287});
		this.add(txtMontoDiarioViatico, {left: 170, top: 283});
		txtMontoDiarioViatico.setTabIndex(17);
		
		this.add(txtAdicionalViatico, {left: 290, top: 283});
		txtAdicionalViatico.setTabIndex(17);
		
		this.add(new qx.ui.basic.Label("*"), {left: 162, top: 315});
		this.add(txtMontoDiarioAlojam, {left: 170, top: 311});
		txtMontoDiarioAlojam.setTabIndex(18);
	} else {
		this.add(lblDiarioViatico, {left: 170, top: 287});
		this.add(lblAdicional, {left: 290, top: 287});
		this.add(lblDiarioAlojam, {left: 170, top: 315});
	}
	
	//txtAdicionalViatico.getChildControl("textfield").bind("value", lblAdicional, "value");
	
	var lblSubtotalViatico = new qx.ui.basic.Label("Subt.: 0,00");
	this.add(lblSubtotalViatico, {left: 380, top: 287});
	//this.add(new qx.ui.basic.Label("Subtotal:"), {left: 500, top: 247});
	
	//txtSubtotalViatico.bind("value", lblSubtotalViatico, "value");
	
	
	//this.add(new qx.ui.basic.Label("*"), {left: 185, top: 311});
	
	//txtMontoDiarioAlojam.getChildControl("textfield").bind("value", lblDiarioAlojam, "value");
	
	var lblSubtotalAlojam = new qx.ui.basic.Label("Subt.: 0,00");
	this.add(lblSubtotalAlojam, {left: 380, top: 315});
	//this.add(new qx.ui.basic.Label("Subtotal:"), {left: 500, top: 277});
	
	//txtSubtotalAlojam.bind("value", lblSubtotalAlojam, "value");

	
	var lblTotal = new qx.ui.basic.Label("Total: 0,00");
	this.add(lblTotal, {left: 320, top: 459});
	

	var groupbox = new qx.ui.groupbox.GroupBox("Lugar de comisión");
	groupbox.setLayout(new qx.ui.layout.Canvas())
	groupbox.setWidth(330);
	groupbox.setHeight(174);
	var cboLocalidadSel = new componente.comp.ui.ramon.combobox.ComboBoxAuto({url: "services/", serviceName: "viaticos.Viaticos", methodName: "autocompletarLocalidad"});
	var lstLocalidadSel = cboLocalidadSel.getChildControl("list");
	var btnAgregarLocalidad = new qx.ui.form.Button("Agregar");
	btnAgregarLocalidad.setEnabled(estado!="L");
	btnAgregarLocalidad.addListener("execute", function(e){
		if (! lstLocalidadSel.isSelectionEmpty()) {
			var selection = lstLocalidadSel.getSelection()[0];
			var listItem = lstLocalidad.findItem(selection.getLabel());
			if (!listItem) {
				listItem = new qx.ui.form.ListItem(selection.getLabel(), null, selection.getModel());
				lstLocalidad.add(listItem);
				lstLocalidad.setSelection([listItem]);
				lstLocalidadSel.removeAll();
				cboLocalidadSel.setValue("");
			} else lstLocalidad.setSelection([listItem]);
		}
		cboLocalidadSel.focus();
	});
	
	var btnBorrar = new qx.ui.form.Button("Borrar");
	btnBorrar.setEnabled(estado!="L");
	btnBorrar.addListener("execute", function(e){
		var index, length, children;
		
		if (! lstLocalidad.isSelectionEmpty()) {
			index = lstLocalidad.indexOf(lstLocalidad.getSelection()[0]);
			lstLocalidad.remove(lstLocalidad.getSelection()[0]);
			children = lstLocalidad.getChildren();
			length = children.length;
			if (length > 0) {
				if (index <= length - 1) lstLocalidad.setSelection([children[index]]); else lstLocalidad.setSelection([children[length - 1]]);
			}
			cboLocalidadSel.setValue("");
			cboLocalidadSel.focus();
		}
	});
	
	
	groupbox.add(cboLocalidadSel, {left: 0, top: 0, right: 0});
	groupbox.add(btnAgregarLocalidad, {left: 0, top: 30});
	groupbox.add(btnBorrar, {right: 0, top: 30});
	groupbox.add(lstLocalidad, {left: 0, top: 60, right: 0, bottom: 0});
	this.add(groupbox, {right: 20, top: 100});
	

	
	/*
	var formView = new componente.comp.ui.ramon.abstractrenderer.Grid(form, 30, 30, 2);
	this.add(formView, {left: 0, top: 95})
	arrayTabIndex = arrayTabIndex.concat(formView.getChildren());
	*/
	
	
	

	var controllerForm = new qx.data.controller.Form(null, form);
	
	var validationManager = form.getValidationManager();
	/*
	validationManager.setValidator(new qx.ui.form.validation.AsyncValidator(function(items, asyncValidator){
		var bool = true;
		for (var x = 0; x < items.length; x++) {
			bool = bool && items[x].isValid();
		}
		if (bool) {
			var d = dtfFechadesde.getValue();
			var d = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Number(txtHoradesde.getValue().substr(0, 2)), Number(txtHoradesde.getValue().substr(3, 2)));

			var h = dtfFechahasta.getValue();
			var h = new Date(h.getFullYear(), h.getMonth(), h.getDate(), Number(txtHorahasta.getValue().substr(0, 2)), Number(txtHorahasta.getValue().substr(3, 2)));
			if (h - d <= 0) {
				dtfFechadesde.setInvalidMessage("Intervalo de tiempo incorrectamente definido");
				dtfFechahasta.setInvalidMessage("Intervalo de tiempo incorrectamente definido");
				txtHoradesde.setInvalidMessage("Intervalo de tiempo incorrectamente definido");
				txtHorahasta.setInvalidMessage("Intervalo de tiempo incorrectamente definido");
				dtfFechadesde.setValid(false);
				dtfFechahasta.setValid(false);
				txtHoradesde.setValid(false);
				txtHorahasta.setValid(false);
				dtfFechadesde.selectAllText();
				dtfFechadesde.focus();
			} else {
				var model = qx.util.Serializer.toNativeObject(modelForm);
				model.organismo_area_id = organismo_area_id;
				model.subtotal_viatico2 = model.subtotal_viatico1;
				model.fecha_desde2 = model.fecha_desde1;
				model.hora_desde2 = model.hora_desde1;
				model.fecha_hasta2 = model.fecha_hasta1;
				model.hora_hasta2 = model.hora_hasta1;
				model.estado = estado;
				var p = model;
				
				var rpc = new componente.comp.io.ramon.rpc.Rpc("services/", "viaticos.Viaticos");
				rpc.callAsync(function(resultado, error, id){
					strTopeMensual = "";
					bool = true;
					if (resultado.length > 0) {
						for (var x = 0; x < resultado.length; x++) {
							if (resultado[x].descrip == "vehiculo") {
								bool = false;
								cboVehiculo.setInvalidMessage(resultado[x].message);
								cboVehiculo.setValid(false);
								cboVehiculo.focus();
								cboVehiculo.selectAllText();
							} else if (resultado[x].descrip == "intervalo") {
								bool = false;
								dtfFechadesde.setInvalidMessage(resultado[x].message);
								dtfFechahasta.setInvalidMessage(resultado[x].message);
								txtHoradesde.setInvalidMessage(resultado[x].message);
								txtHorahasta.setInvalidMessage(resultado[x].message);
								dtfFechadesde.setValid(false);
								dtfFechahasta.setValid(false);
								txtHoradesde.setValid(false);
								txtHorahasta.setValid(false);
								dtfFechadesde.focus();
								dtfFechadesde.selectAllText();
							} else if (resultado[x].descrip == "documentacion_id") {
								bool = false;
								txtAsunto.setInvalidMessage(resultado[x].message);
								txtAsunto.setValid(false);
								txtAsunto.focus();
							} else if (resultado[x].descrip == "porc_tope_cargo") {
								strTopeMensual = "Con el importe de viático $" + numberformatMonto.format(model.subtotal_viatico2) + " se supera tope mensual.";
							}
						}
						if (bool) asyncValidator.setValid(true);
					} else asyncValidator.setValid(true);
				}, "validar_viatico", p);
			}
		} else {
			asyncValidator.setValid(false);
		}
	}));
	*/
	
	
	
	
	
	
	
	
	validationManager.setValidator(new qx.ui.form.validation.AsyncValidator(function(items, asyncValidator){
		var bool = true;
		for (var x = 0; x < items.length; x++) {
			bool = bool && items[x].isValid();
		}
		if (bool) {
			var d = dtfFechadesde.getValue();
			var d = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Number(txtHoradesde.getValue().substr(0, 2)), Number(txtHoradesde.getValue().substr(3, 2)));

			var h = dtfFechahasta.getValue();
			var h = new Date(h.getFullYear(), h.getMonth(), h.getDate(), Number(txtHorahasta.getValue().substr(0, 2)), Number(txtHorahasta.getValue().substr(3, 2)));
			if (h - d <= 0) {
				dtfFechadesde.setInvalidMessage("Intervalo de tiempo incorrectamente definido");
				dtfFechahasta.setInvalidMessage("Intervalo de tiempo incorrectamente definido");
				txtHoradesde.setInvalidMessage("Intervalo de tiempo incorrectamente definido");
				txtHorahasta.setInvalidMessage("Intervalo de tiempo incorrectamente definido");
				dtfFechadesde.setValid(false);
				dtfFechahasta.setValid(false);
				txtHoradesde.setValid(false);
				txtHorahasta.setValid(false);
				dtfFechadesde.selectAllText();
				dtfFechadesde.focus();
			} else {
				var model = qx.util.Serializer.toNativeObject(modelForm);
				model.organismo_area_id = organismo_area_id;
				model.fecha_desde2 = model.fecha_desde1;
				model.hora_desde2 = model.hora_desde1;
				model.fecha_hasta2 = model.fecha_hasta1;
				model.hora_hasta2 = model.hora_hasta1;
				model.cant_dias_viatico2 = model.cant_dias_viatico1;
				model.adicional_viatico2 = model.adicional_viatico1;
				model.subtotal_viatico2 = model.subtotal_viatico1;
				model.cant_dias_alojam2 = model.cant_dias_alojam1;
				model.subtotal_alojam2 = model.subtotal_alojam1;
				model.combustible2 = model.combustible1;
				model.pasajes2 = model.pasajes1;
				model.otros_gastos2 = model.otros_gastos1;
				model.estado = estado;
				model.tipo_viatico = tipo_viatico;
				
				if (estado=="L") {
					aux = new Date();
					aux = aux.getFullYear() + "-" + qx.lang.String.pad(String(aux.getMonth() + 1), 2, "0") + "-" + qx.lang.String.pad(String(aux.getDate()), 2, "0");
					json.fecha_liquidacion = aux;
					validar_tope = false;
				}
				json.aloj_emp = slbAloj_emp.indexOf(slbAloj_emp.getSelection()[0]);
				
				model.json = qx.lang.Json.stringify(json);

				var p = {};
				p.model = model;
				p.validar_tope = validar_tope;
				p.localidad = [];
				
				var aux = lstLocalidad.getChildren();
				for (var x = 0; x < aux.length; x++) {
					p.localidad.push(aux[x].getModel());
				}
				
				//alert(qx.lang.Json.stringify(p, null, 2));
				
				var rpc = new componente.comp.io.ramon.rpc.Rpc("services/", "viaticos.Viaticos");
				rpc.callAsync(function(resultado, error, id){
					//alert(qx.lang.Json.stringify(error, null, 2));
					//alert(qx.lang.Json.stringify(resultado, null, 2));
					if (resultado.error.length == 1 && resultado.error[0].descrip == "porc_tope_cargo") {
						var aux = "Con el importe de viático $" + numberformatMonto.format(model.subtotal_viatico2) + " se supera tope mensual.";
						if (lstPersonal.getSelection()[0].getUserData("datos").eximir_tope_viatico) {
							aux+= " Permitir grabar viático?";
							
							(new dialog.Confirm({
							        "message"   : aux,
							        "callback"  :	function(e){
														if (e) {
															validar_tope = false;
															form.validate();
														}
													},
							        //"context"   : contexto,
							        "image"     : "icon/48/status/dialog-warning.png"
							})).show();
						} else {
							aux+= " El titular no está autorizado a superar el mismo.";
							dialog.Dialog.error(aux, function(e){
								
							});
						}
						
						asyncValidator.setValid(false);
					} else if (resultado.error.length > 0) {
						for (var x = 0; x < resultado.error.length; x++) {
							if (resultado.error[x].descrip == "vehiculo") {
								cboVehiculo.setInvalidMessage(resultado.error[x].message);
								cboVehiculo.setValid(false);

								//cboVehiculo.selectAllText();
							} else if (resultado.error[x].descrip == "intervalo") {
								dtfFechadesde.setInvalidMessage(resultado.error[x].message);
								dtfFechahasta.setInvalidMessage(resultado.error[x].message);
								txtHoradesde.setInvalidMessage(resultado.error[x].message);
								txtHorahasta.setInvalidMessage(resultado.error[x].message);
								dtfFechadesde.setValid(false);
								dtfFechahasta.setValid(false);
								txtHoradesde.setValid(false);
								txtHorahasta.setValid(false);
								
								//dtfFechadesde.selectAllText();
							} else if (resultado.error[x].descrip == "documentacion_id") {
								if (estado=="L") {
									dialog.Dialog.error("El asunto no está ubicado en el área correcta.");
								} else {
									txtAsunto.setInvalidMessage(resultado.error[x].message);
									txtAsunto.setValid(false);
								}
							}
						}
						asyncValidator.setValid(false);
					} else {
						ultimo_id_viatico = resultado.id_viatico;
						asyncValidator.setValid(true);
					}
				}, "validar_alta_modifica_viatico", p);
			}
		} else {
			asyncValidator.setValid(false);
		}
	}));
	
	
	validationManager.addListener("complete", function(e){
		if (validationManager.getValid()) {
			this.fireDataEvent("aceptado", ultimo_id_viatico);
			
			leer_titulares(txtAsunto.getValue());
			
			if (id_viatico=="0") {
				preparar_campos();
				dialog.Dialog.alert("Grabado correctamente", function(e){
					cboPersonal.focus();
				});
			} else {
				btnCancelar.execute();
			}
		} else {
			var items = form.getItems();
			for (var item in items) {
				if (!items[item].isValid()) {
					items[item].focus();
					break;
				}
			}
		}
	}, this);
	
	
	
	
	
	
	
	/*
	validationManager.addListener("complete", function(e){
		if (validationManager.getValid()) {
			var functionGrabar = function(e) {
				if (e) {
					var aux;
					var model = qx.util.Serializer.toNativeObject(modelForm);
					model.organismo_area_id = organismo_area_id;
					model.fecha_desde2 = model.fecha_desde1;
					model.hora_desde2 = model.hora_desde1;
					model.fecha_hasta2 = model.fecha_hasta1;
					model.hora_hasta2 = model.hora_hasta1;
					model.cant_dias_viatico2 = model.cant_dias_viatico1;
					model.adicional_viatico2 = model.adicional_viatico1;
					model.subtotal_viatico2 = model.subtotal_viatico1;
					model.cant_dias_alojam2 = model.cant_dias_alojam1;
					model.subtotal_alojam2 = model.subtotal_alojam1;
					model.combustible2 = model.combustible1;
					model.pasajes2 = model.pasajes1;
					model.otros_gastos2 = model.otros_gastos1;
					model.estado = estado;
					if (estado=="L") {
						aux = new Date();
						aux = aux.getFullYear() + "-" + qx.lang.String.pad(String(aux.getMonth() + 1), 2, "0") + "-" + qx.lang.String.pad(String(aux.getDate()), 2, "0");
						json.fecha_liquidacion = aux;
					}
					model.json = qx.lang.Json.stringify(json);
					
					
					var localidad = [];
					aux = lstLocalidad.getChildren();
					for (var x = 0; x < aux.length; x++) {
						localidad.push(aux[x].getModel());
					}
					
					model.tipo_viatico = tipo_viatico;
					
					var p = {};
					p.model = model;
					p.localidad = localidad;
					
					var rpc = new componente.comp.io.ramon.rpc.Rpc("services/", "viaticos.Viaticos");
					try {
						var resultado = rpc.callSync("alta_modifica_viatico", p);
					} catch (ex) {
						alert("Sync exception: " + ex);
					}
					
					contexto.fireDataEvent("aceptado", resultado);
					
					leer_titulares(txtAsunto.getValue());
					
					if (id_viatico=="0") {
						preparar_campos();
						dialog.Dialog.alert("Grabado correctamente", function(e){
							cboPersonal.focus();
						});
					} else {
						btnCancelar.fireEvent("execute");
					}
				}
			}
			
			if (strTopeMensual=="" || estado == "L") {
				functionGrabar(true);
			} else {
				if (lstPersonal.getSelection()[0].getUserData("datos").eximir_tope_viatico) {
					strTopeMensual = strTopeMensual + " Permitir grabar viático?";
					(new dialog.Confirm({
					        "message"   : strTopeMensual,
					        "callback"  : functionGrabar,
					        "context"   : contexto,
					        "image"     : "icon/48/status/dialog-warning.png"
					})).show();
				} else {
					strTopeMensual = strTopeMensual + " El titular no está autorizado a superar el mismo.";
					(new dialog.Alert({
					        "message"   : strTopeMensual,
					        "image"     : "icon/48/status/dialog-error.png"
					})).show();
				}
			}
		} else {
			var items = form.getItems();
			for (var item in items) {
				if (!items[item].isValid()) {
					items[item].focus();
					break;
				}
			}
		}
	}, this);
	*/
	
	var btnAceptar = new qx.ui.form.Button("Aceptar");
	btnAceptar.setTabIndex(40);
	btnAceptar.addListener("execute", function(e){
		//var model = qx.util.Serializer.toNativeObject(modelForm);
		//alert(qx.util.Json.stringify(model, true));
		
		
		form.validate();
	});
	this.add(btnAceptar, {left: 320, bottom: 0});
	
	var btnCancelar = new qx.ui.form.Button("Cancelar");
	btnCancelar.setTabIndex(41);
	btnCancelar.addListener("execute", function(e){
		//86400000 milisegundos son 1 dia
		//3600000 milisegundos son 1 hora
	try {
		this.close();
	} catch (ex) {
		alert("Sync exception: " + ex);
	}
		//this.close();
		//this.destroy();
	}, this);
	this.add(btnCancelar, {left: 520, bottom: 0});
	

	

	
	var preparar_campos = function() {
		var aux = new Date();
		aux = aux.getFullYear() + "-" + (aux.getMonth() + 1) + "-" + aux.getDate();
		
		json = {operaciones: [{fecha: aux, organismo_area: appMain.rowOrganismo_area.label, usuario: appMain._SYSusuario, operacion: "Emisión"}]};
		
		var rpc = new componente.comp.io.ramon.rpc.Rpc("services/", "viaticos.Viaticos");
		try {
			var resultado = rpc.callSync("leer_paramet");
		} catch (ex) {
			alert("Sync exception: " + ex);
		}

		json.paramet = resultado[0];
		json.aloj_emp = 0;
		
		slbAloj_emp_item1.setLabel(numberformatMontoEs.format(json.paramet.alojam_emp_dp));
		slbAloj_emp_item1.setModel(json.paramet.alojam_emp_dp);
		slbAloj_emp_item2.setLabel(numberformatMontoEs.format(json.paramet.alojam_emp_dp_sf));
		slbAloj_emp_item2.setModel(json.paramet.alojam_emp_dp_sf);
		
		organismo_area_id = appMain.rowOrganismo_area.organismo_area_id;
		
		cboPersonal.setValue("");
		
		modelForm = controllerForm.createModel(true);
		var model = qx.util.Serializer.toNativeObject(modelForm);
		if (tipo_viatico=="A") {
			model.nro_viatico = json.paramet.nro_viatico + 1;
			lblNroViatico.setValue("Nro.viático: " + model.nro_viatico);
		}
		model.monto_diario_viatico = json.paramet.diario_dp;
		model.monto_diario_alojam = json.paramet.alojam_emp_dp;
		model.id_viatico = "0";
		
		modelForm = qx.data.marshal.Json.createModel(model);
		controllerForm.setModel(modelForm);
	}
	
	

	if (id_viatico=="0") {
		this.setCaption("Alta de viático" + this.getCaption());
		btnAceptar.setLabel("Grabar");
		btnCancelar.setLabel("Cerrar");
		preparar_campos();
	} else {
		var p = {};
		var rpc = new componente.comp.io.ramon.rpc.Rpc("services/", "viaticos.Viaticos");
		try {
			var resultado = rpc.callSync("leer_viatico", id_viatico);
		} catch (ex) {
			alert("Sync exception: " + ex);
		}
		
		json = qx.lang.Json.parse(resultado.viatico.json);
		
		slbAloj_emp_item1.setLabel(numberformatMontoEs.format(json.paramet.alojam_emp_dp));
		slbAloj_emp_item1.setModel(json.paramet.alojam_emp_dp);
		slbAloj_emp_item2.setLabel(numberformatMontoEs.format(json.paramet.alojam_emp_dp_sf));
		slbAloj_emp_item2.setModel(json.paramet.alojam_emp_dp_sf);
		
		var aux = new Date();
		aux = aux.getFullYear() + "-" + (aux.getMonth() + 1) + "-" + aux.getDate();
		if (estado == "L") {
			this.setCaption("Liquidación de viático" + this.getCaption());
			json.operaciones.push({fecha: aux, organismo_area: appMain.rowOrganismo_area.label, usuario: appMain._SYSusuario, operacion: "Liquidar"});
		} else {
			this.setCaption("Modificación de viático" + this.getCaption());
			json.operaciones.push({fecha: aux, organismo_area: appMain.rowOrganismo_area.label, usuario: appMain._SYSusuario, operacion: "Modificar"});
		}
		
		//alert(qx.lang.Json.stringify(json));

		
		//organismo_area_id = resultado.viatico.organismo_area_id;
		organismo_area_id = appMain.rowOrganismo_area.organismo_area_id;
		
		var listItem;
		//cboOrganismoArea.add(new qx.ui.form.ListItem(resultado.cboOrganismoArea.label, null, resultado.cboOrganismoArea.model));
		listItem = new qx.ui.form.ListItem(resultado.cboPersonal.label, null, resultado.cboPersonal.model);
		listItem.setUserData("datos", resultado.cboPersonal);
		cboPersonal.add(listItem);
		cboMotivo.add(new qx.ui.form.ListItem(resultado.cboMotivo.label, null, resultado.cboMotivo.model));
		cboOrganismoAreaOrigen.add(new qx.ui.form.ListItem(resultado.cboOrganismoAreaOrigen.label, null, resultado.cboOrganismoAreaOrigen.model));
		if (resultado.cboVehiculo) cboVehiculo.add(new qx.ui.form.ListItem(resultado.cboVehiculo.label, null, resultado.cboVehiculo.model));
		if (resultado.cboFuncionario) {
			listItem = new qx.ui.form.ListItem(resultado.cboFuncionario.label, null, resultado.cboFuncionario.model);
			listItem.setUserData("datos", resultado.cboFuncionario);
			cboFuncionario.add(listItem);
			resultado.viatico.codigo_002fun = parseFloat(resultado.cboFuncionario.codigo_002);
		} else {
			resultado.viatico.codigo_002fun = 0;
		}
		//if (resultado.cboCtaCte) cboCtaCte.add(new qx.ui.form.ListItem(resultado.cboCtaCte.label, null, resultado.cboCtaCte.model));
		
		
		
		var listItem;
		for (var x = 0; x < resultado.localidad.length; x++) {
			listItem = new qx.ui.form.ListItem(resultado.localidad[x].label, null, resultado.localidad[x].model);
			lstLocalidad.add(listItem);
			lstLocalidad.setSelection([listItem]);
		}
		
		if (tipo_viatico=="A") lblNroViatico.setValue("Nro.viático: " + resultado.viatico.nro_viatico);
		
		var ano, mes, dia;
		ano = parseFloat(resultado.viatico.fecha_desde1.substr(0, 4));
		mes = parseFloat(resultado.viatico.fecha_desde1.substr(5, 2)) - 1;
		dia = parseFloat(resultado.viatico.fecha_desde1.substr(8, 2));
		resultado.viatico.fecha_desde1 = new Date(ano, mes, dia);
		
		resultado.viatico.hora_desde1 = resultado.viatico.hora_desde1.substr(0, 5);
		
		ano = parseFloat(resultado.viatico.fecha_hasta1.substr(0, 4));
		mes = parseFloat(resultado.viatico.fecha_hasta1.substr(5, 2)) - 1;
		dia = parseFloat(resultado.viatico.fecha_hasta1.substr(8, 2));
		resultado.viatico.fecha_hasta1 = new Date(ano, mes, dia);
		
		resultado.viatico.hora_hasta1 = resultado.viatico.hora_hasta1.substr(0, 5);
		
		//resultado.viatico.cboOrganismoArea = "";
		resultado.viatico.cboOrganismoAreaOrigen = "";
		resultado.viatico.cboPersonal = "";
		resultado.viatico.codigo_002per = parseFloat(resultado.cboPersonal.codigo_002);
		resultado.viatico.cboMotivo = "";
		resultado.viatico.lstLocalidad = listItem.getModel();
		//resultado.viatico.adicional_viatico1 = 0;
		resultado.viatico.cboVehiculo = "";
		resultado.viatico.cboFuncionario = "";
		if (resultado.viatico.fecha_cheque != null) {
			ano = parseFloat(resultado.viatico.fecha_cheque.substr(0, 4));
			mes = parseFloat(resultado.viatico.fecha_cheque.substr(5, 2)) - 1;
			dia = parseFloat(resultado.viatico.fecha_cheque.substr(8, 2));
			resultado.viatico.fecha_cheque = new Date(ano, mes, dia);
		}
		//resultado.viatico.cboCtaCte = "";
		
		resultado.viatico.dummy = "";
		resultado.viatico.dummy2 = "";
		
		modelForm = qx.data.marshal.Json.createModel(resultado.viatico);
		controllerForm.setModel(modelForm);
		
		txtMontoDiarioViatico.setValue(resultado.viatico.monto_diario_viatico);
		txtAdicionalViatico.setValue(resultado.viatico.adicional_viatico1);
		txtMontoDiarioAlojam.setValue(resultado.viatico.monto_diario_alojam);
		
		if (json.aloj_emp == null) {
			slbAloj_emp.setVisibility("hidden");
		} else {
			slbAloj_emp.setSelection([slbAloj_emp.getChildren()[json.aloj_emp]]);
		}
	}
	

	
	
	
	var children = groupbox.getChildren();
	for (var x = 0; x < children.length; x++) {
		children[x].setTabIndex(x + 11);
	}
	
	

	var lstLista = new qx.ui.list.List().set({width: 330, height: 90});
	lstLista.setTabIndex(45);
	this.add(lstLista, {left: 525, top: 0});


	},
	members : 
	{

	},
	events : 
	{
		"aceptado": "qx.event.type.Event"
	}
});
qx.Class.define("viaticos.viaticos.windowViatMen",
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
	var organismo_area_id;
	var modelForm = null;
	var numberformatCantDias = new qx.util.format.NumberFormat("en").set({groupingUsed: false, maximumFractionDigits: 0});
	var numberformatMonto = new qx.util.format.NumberFormat("en").set({groupingUsed: false, maximumFractionDigits: 2, minimumFractionDigits: 2});
	var numberformatMontoEs = new qx.util.format.NumberFormat("es").set({groupingUsed: false, maximumFractionDigits: 2, minimumFractionDigits: 2});
	var contexto = this;
	var strTopeMensual = "";
	
	var sumar = function() {
		var aux;
		var subtotal_viatico2 = 0;
		
		aux = txtDp12.getValue() * txtDp12diario.getValue();
		subtotal_viatico2+= aux;
		lblSubtotD12.setValue(numberformatMontoEs.format(aux));
		
		aux = txtDp34.getValue() * txtDp34diario.getValue();
		subtotal_viatico2+= aux;
		lblSubtotD34.setValue(numberformatMontoEs.format(aux));
		
		aux = txtDp1.getValue() * txtDp1diario.getValue();
		subtotal_viatico2+= aux;
		lblSubtotD1.setValue(numberformatMontoEs.format(aux));
		
		aux = txtFp12.getValue() * txtFp12diario.getValue();
		subtotal_viatico2+= aux;
		lblSubtotF12.setValue(numberformatMontoEs.format(aux));
		
		aux = txtFp34.getValue() * txtFp34diario.getValue();
		subtotal_viatico2+= aux;
		lblSubtotF34.setValue(numberformatMontoEs.format(aux));
		
		aux = txtFp1.getValue() * txtFp1diario.getValue();
		subtotal_viatico2+= aux;
		lblSubtotF1.setValue(numberformatMontoEs.format(aux));
		
		txtSubtotalViatico2.setValue(subtotal_viatico2);
		//txtSubtotalAlojam.setValue(txtCantDiasAlojam.getValue() * txtMontoDiarioAlojam.getValue());
		txtImporteTotal.setValue(subtotal_viatico2 + txtPasajes.getValue() + txtSubtotal_alojam2.getValue());
		lblSubtotal_viatico2.setValue("Subt.: " + numberformatMontoEs.format(subtotal_viatico2));
		lblTotal.setValue("Total: " + numberformatMontoEs.format(txtImporteTotal.getValue()));
	}
	
	
	
	var asignarMontos = function() {
		if (!lstPersonal.isSelectionEmpty() && lstPersonal.getSelection()[0].getUserData("datos").funcionario) {
			var aux = txtCodigo_002per.getValue() * 4.5 / 100;
			txtDp1diario.setValue(aux);
			txtFp1diario.setValue(aux);
			
			aux = txtDp1diario.getValue() * 50 / 100;
			txtDp12diario.setValue(aux);
			txtFp12diario.setValue(aux);
			
			aux = txtDp1diario.getValue() * 75 / 100;
			txtDp34diario.setValue(aux);
			txtFp34diario.setValue(aux);
		} else {
			txtDp12diario.setValue(json.paramet.diario_12_dp);
			txtDp34diario.setValue(json.paramet.diario_34_dp);
			txtDp1diario.setValue(json.paramet.diario_dp);
			txtFp12diario.setValue(json.paramet.diario_12_fp);
			txtFp34diario.setValue(json.paramet.diario_34_fp);
			txtFp1diario.setValue(json.paramet.diario_fp);
		}
		
		sumar();
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
	form.add(txtAsunto, "Asunto", null, "documentacion_id", null, {enabled: estado!="L", grupo: 1, item: {row: 0, column: 1, colSpan: 4}});
	
	
	var txtDummy = new qx.ui.form.TextField();
	txtDummy.setVisibility("hidden");
	form.add(txtDummy, "", null, "dummy", null, {enabled: false, grupo: 1, item: {row: 1, column: 1, colSpan: 13}});
	/*
	var cboOrganismoArea = new componente.comp.ui.ramon.combobox.ComboBoxAuto({url: "services/", serviceName: "viaticos.Viaticos", methodName: "autocompletarOrganismoArea"});
	cboOrganismoArea.setRequired(true);
	form.add(cboOrganismoArea, "Org/Area", function(value) {
		if (lstOrganismoArea.isSelectionEmpty()) throw new qx.core.ValidationError("Validation Error", "Debe seleccionar Organismo/Area");
	}, "cboOrganismoArea", null, {grupo: 1, item: {row: 1, column: 1, colSpan: 13}});
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
	});
	form.add(lstPersonal, "", null, "id_personal");
	
	
	var txtCodigo_002per = new qx.ui.form.Spinner(0, 0, 100000);
	txtCodigo_002per.getChildControl("upbutton").setVisibility("excluded");
	txtCodigo_002per.getChildControl("downbutton").setVisibility("excluded");
	txtCodigo_002per.setSingleStep(0);
	txtCodigo_002per.setPageStep(0);
	txtCodigo_002per.setNumberFormat(numberformatMonto);
	txtCodigo_002per.addListener("changeValue", asignarMontos);
	//form.add(txtCodigo_002per, "Cód.002", qx.util.Validate.range(1, 100000, "Debe ingresar Código 002 del titular"), "codigo_002per", null, {enabled: estado!="L", grupo: 1, item: {row: 4, column: 1, colSpan: 3}});
	form.add(txtCodigo_002per, "Cód.002", null, "codigo_002per", null, {enabled: false, grupo: 1, item: {row: 4, column: 1, colSpan: 3}});

	
	
	var cboMotivo = new componente.comp.ui.ramon.combobox.ComboBoxAuto({url: "services/", serviceName: "viaticos.Viaticos", methodName: "autocompletarMotivo"});
	cboMotivo.setRequired(true);
	form.add(cboMotivo, "Motivo", function(value) {
		if (lstMotivo.isSelectionEmpty()) throw new qx.core.ValidationError("Validation Error", "Debe seleccionar un motivo");
	}, "cboMotivo", null, {enabled: estado!="L", grupo: 1, item: {row: 5, column: 1, colSpan: 13}});
	var lstMotivo = cboMotivo.getChildControl("list");
	form.add(lstMotivo, "", null, "id_motivo");
	
	
	var aux = new Date();
	
	var slbMes = new qx.ui.form.SelectBox();
	slbMes.add(new qx.ui.form.ListItem("Enero", null, 1));
	slbMes.add(new qx.ui.form.ListItem("Febrero", null, 2));
	slbMes.add(new qx.ui.form.ListItem("Marzo", null, 3));
	slbMes.add(new qx.ui.form.ListItem("Abril", null, 4));
	slbMes.add(new qx.ui.form.ListItem("Mayo", null, 5));
	slbMes.add(new qx.ui.form.ListItem("Junio", null, 6));
	slbMes.add(new qx.ui.form.ListItem("Julio", null, 7));
	slbMes.add(new qx.ui.form.ListItem("Agosto", null, 8));
	slbMes.add(new qx.ui.form.ListItem("Septiembre", null, 9));
	slbMes.add(new qx.ui.form.ListItem("Octubre", null, 10));
	slbMes.add(new qx.ui.form.ListItem("Noviembre", null, 11));
	slbMes.add(new qx.ui.form.ListItem("Diciembre", null, 12));
	slbMes.setModelSelection([aux.getMonth() + 1]);
	form.add(slbMes, "Periodo", null, "mes", null, {enabled: estado!="L", grupo: 1, item: {row: 6, column: 1, colSpan: 4}})
	
	
	var txtAno = new qx.ui.form.Spinner(1970, aux.getFullYear(), 2030);
	form.add(txtAno, "", null, "ano", null, {enabled: estado!="L", grupo: 1, item: {row: 6, column: 6, colSpan: 3}});
	

	var lstLocalidad = new qx.ui.form.List();
	lstLocalidad.setRequired(true);
	lstLocalidad.setRequiredInvalidMessage("Debe agregar localidad/es");
	form.add(lstLocalidad, "", null, "lstLocalidad");

	
	var txtDummy = new qx.ui.form.TextField();
	txtDummy.setVisibility("hidden");
	//form.add(txtDummy, "", null, "dummy", null, {enabled: false, grupo: 1, item: {row: 8, column: 1, colSpan: 5}});

	
	
	var txtDp12 = new qx.ui.form.Spinner(0, 0, 100000);
	txtDp12.getChildControl("upbutton").setVisibility("excluded");
	txtDp12.getChildControl("downbutton").setVisibility("excluded");
	txtDp12.setSingleStep(0);
	txtDp12.setPageStep(0);
	txtDp12.setNumberFormat(numberformatCantDias);
	txtDp12.addListener("changeValue", sumar);
	form.add(txtDp12, "1/2", null, "dp12", null, {enabled: estado!="L", grupo: 2, item: {row: 1, column: 1, colSpan: 2}});
	
	var txtDp12diario = new qx.ui.form.Spinner(0, 0, 100000);
	txtDp12diario.getChildControl("upbutton").setVisibility("excluded");
	txtDp12diario.getChildControl("downbutton").setVisibility("excluded");
	txtDp12diario.setSingleStep(0);
	txtDp12diario.setPageStep(0);
	txtDp12diario.setNumberFormat(numberformatMonto);
	txtDp12diario.addListener("changeValue", sumar);
	form.add(txtDp12diario, "", null, "diario_12_dp", null, {enabled: estado!="L", grupo: 2, item: {row: 1, column: 4, colSpan: 3}});

	var txtDp34 = new qx.ui.form.Spinner(0, 0, 100000);
	txtDp34.getChildControl("upbutton").setVisibility("excluded");
	txtDp34.getChildControl("downbutton").setVisibility("excluded");
	txtDp34.setSingleStep(0);
	txtDp34.setPageStep(0);
	txtDp34.setNumberFormat(numberformatCantDias);
	txtDp34.addListener("changeValue", sumar);
	form.add(txtDp34, "3/4", null, "dp34", null, {enabled: estado!="L", grupo: 2, item: {row: 2, column: 1, colSpan: 2}});
	
	var txtDp34diario = new qx.ui.form.Spinner(0, 0, 100000);
	txtDp34diario.getChildControl("upbutton").setVisibility("excluded");
	txtDp34diario.getChildControl("downbutton").setVisibility("excluded");
	txtDp34diario.setSingleStep(0);
	txtDp34diario.setPageStep(0);
	txtDp34diario.setNumberFormat(numberformatMonto);
	txtDp34diario.addListener("changeValue", sumar);
	form.add(txtDp34diario, "", null, "diario_34_dp", null, {enabled: estado!="L", grupo: 2, item: {row: 2, column: 4, colSpan: 3}});
	
	var txtDp1 = new qx.ui.form.Spinner(0, 0, 100000);
	txtDp1.getChildControl("upbutton").setVisibility("excluded");
	txtDp1.getChildControl("downbutton").setVisibility("excluded");
	txtDp1.setSingleStep(0);
	txtDp1.setPageStep(0);
	txtDp1.setNumberFormat(numberformatCantDias);
	txtDp1.addListener("changeValue", sumar);
	form.add(txtDp1, "1", null, "dp1", null, {enabled: estado!="L", grupo: 2, item: {row: 3, column: 1, colSpan: 2}});
	
	var txtDp1diario = new qx.ui.form.Spinner(0, 0, 100000);
	txtDp1diario.getChildControl("upbutton").setVisibility("excluded");
	txtDp1diario.getChildControl("downbutton").setVisibility("excluded");
	txtDp1diario.setSingleStep(0);
	txtDp1diario.setPageStep(0);
	txtDp1diario.setNumberFormat(numberformatMonto);
	txtDp1diario.addListener("changeValue", sumar);
	form.add(txtDp1diario, "", null, "diario_dp", null, {enabled: estado!="L", grupo: 2, item: {row: 3, column: 4, colSpan: 3}});
	
	
	var txtFp12 = new qx.ui.form.Spinner(0, 0, 100000);
	txtFp12.getChildControl("upbutton").setVisibility("excluded");
	txtFp12.getChildControl("downbutton").setVisibility("excluded");
	txtFp12.setSingleStep(0);
	txtFp12.setPageStep(0);
	txtFp12.setNumberFormat(numberformatCantDias);
	txtFp12.addListener("changeValue", sumar);
	form.add(txtFp12, "1/2", null, "fp12", null, {enabled: estado!="L", grupo: 3, item: {row: 1, column: 1, colSpan: 2}});
	
	var txtFp12diario = new qx.ui.form.Spinner(0, 0, 100000);
	txtFp12diario.getChildControl("upbutton").setVisibility("excluded");
	txtFp12diario.getChildControl("downbutton").setVisibility("excluded");
	txtFp12diario.setSingleStep(0);
	txtFp12diario.setPageStep(0);
	txtFp12diario.setNumberFormat(numberformatMonto);
	txtFp12diario.addListener("changeValue", sumar);
	form.add(txtFp12diario, "", null, "diario_12_fp", null, {enabled: estado!="L", grupo: 3, item: {row: 1, column: 4, colSpan: 3}});

	var txtFp34 = new qx.ui.form.Spinner(0, 0, 100000);
	txtFp34.getChildControl("upbutton").setVisibility("excluded");
	txtFp34.getChildControl("downbutton").setVisibility("excluded");
	txtFp34.setSingleStep(0);
	txtFp34.setPageStep(0);
	txtFp34.setNumberFormat(numberformatCantDias);
	txtFp34.addListener("changeValue", sumar);
	form.add(txtFp34, "3/4", null, "fp34", null, {enabled: estado!="L", grupo: 3, item: {row: 2, column: 1, colSpan: 2}});
	
	var txtFp34diario = new qx.ui.form.Spinner(0, 0, 100000);
	txtFp34diario.getChildControl("upbutton").setVisibility("excluded");
	txtFp34diario.getChildControl("downbutton").setVisibility("excluded");
	txtFp34diario.setSingleStep(0);
	txtFp34diario.setPageStep(0);
	txtFp34diario.setNumberFormat(numberformatMonto);
	txtFp34diario.addListener("changeValue", sumar);
	form.add(txtFp34diario, "", null, "diario_34_fp", null, {enabled: estado!="L", grupo: 3, item: {row: 2, column: 4, colSpan: 3}});
	
	var txtFp1 = new qx.ui.form.Spinner(0, 0, 100000);
	txtFp1.getChildControl("upbutton").setVisibility("excluded");
	txtFp1.getChildControl("downbutton").setVisibility("excluded");
	txtFp1.setSingleStep(0);
	txtFp1.setPageStep(0);
	txtFp1.setNumberFormat(numberformatCantDias);
	txtFp1.addListener("changeValue", sumar);
	form.add(txtFp1, "1", null, "fp1", null, {enabled: estado!="L", grupo: 3, item: {row: 3, column: 1, colSpan: 2}});
	
	var txtFp1diario = new qx.ui.form.Spinner(0, 0, 100000);
	txtFp1diario.getChildControl("upbutton").setVisibility("excluded");
	txtFp1diario.getChildControl("downbutton").setVisibility("excluded");
	txtFp1diario.setSingleStep(0);
	txtFp1diario.setPageStep(0);
	txtFp1diario.setNumberFormat(numberformatMonto);
	txtFp1diario.addListener("changeValue", sumar);
	form.add(txtFp1diario, "", null, "diario_fp", null, {enabled: estado!="L", grupo: 3, item: {row: 3, column: 4, colSpan: 3}});

	
	var txtSubtotal_alojam2 = new qx.ui.form.Spinner(0, 0, 100000);
	txtSubtotal_alojam2.getChildControl("upbutton").setVisibility("excluded");
	txtSubtotal_alojam2.getChildControl("downbutton").setVisibility("excluded");
	txtSubtotal_alojam2.setSingleStep(0);
	txtSubtotal_alojam2.setPageStep(0);
	txtSubtotal_alojam2.setNumberFormat(numberformatMonto);
	txtSubtotal_alojam2.addListener("changeValue", sumar);
	form.add(txtSubtotal_alojam2, "Alojamiento", null, "subtotal_alojam2", null, {enabled: estado!="L", grupo: 4, item: {row: 1, column: 1, colSpan: 3}});
	

	var txtPasajes = new qx.ui.form.Spinner(0, 0, 100000);
	txtPasajes.getChildControl("upbutton").setVisibility("excluded");
	txtPasajes.getChildControl("downbutton").setVisibility("excluded");
	txtPasajes.setSingleStep(0);
	txtPasajes.setPageStep(0);
	txtPasajes.setNumberFormat(numberformatMonto);
	txtPasajes.addListener("changeValue", sumar);
	form.add(txtPasajes, "Pasajes", null, "pasajes2", null, {enabled: estado!="L", grupo: 4, item: {row: 2, column: 1, colSpan: 3}});
	
	var txtSubtotalViatico2 = new qx.ui.form.Spinner(0, 0, 100000);
	form.add(txtSubtotalViatico2, "", null, "subtotal_viatico2");
	

	var txtImporteTotal = new qx.ui.form.Spinner(0, 0, 1000000);
	form.add(txtImporteTotal, "Imp.total", null, "importe_total");
	
	

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
	form.add(slbCtaCte, "Cta.Cte.", null, "id_cta_cte", null, {enabled: estado=="L", grupo: 5, item: {row: 14, column: 16, colSpan: 10}});
	
	
	
	
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
	form.add(txtNroCheque, "Nro.cheque", null, "nro_cheque", null, {enabled: estado=="L", grupo: 5, item: {row: 15, column: 16, colSpan: 4}});
	
	var dtfFechacheque = new qx.ui.form.DateField(new Date());
	//dtfFechacheque.setValue(new Date());
	dtfFechacheque.setRequired(true);
	form.add(dtfFechacheque, "F. cheque", function(value) {
		if (dtfFechacheque.getValue()==null && (estado=="L")) throw new qx.core.ValidationError("Validation Error", "Debe ingresar fecha del cheque");
	}, "fecha_cheque", null, {enabled: estado=="L", grupo: 5, item: {row: 16, column: 16, colSpan: 4}});
	

	

	//var formView = new qx.ui.form.renderer.Double(form);
	var formView1 = new componente.comp.ui.ramon.abstractrenderer.Grid(form, 50, 50, 1);
	
	var lblLinea = new qx.ui.basic.Label("<hr>");
	lblLinea.setRich(true);
	lblLinea.setWidth(870);
	//this.add(lblLinea, {left: 10, top: 200});
	
	this.add(formView1, {left: 10, top: 0})
	
	var formView2 = new componente.comp.ui.ramon.abstractrenderer.Grid(form, 50, 50, 2);
	var gbDentro = new qx.ui.groupbox.GroupBox("Dentro de provincia");
	gbDentro.setLayout(new qx.ui.layout.Basic())
	gbDentro.add(formView2, {left: 0, top: 0});
	
	var lblSubtotD12 = new qx.ui.basic.Label("").set({width: 100, textAlign: "right"});
	var lblSubtotD34 = new qx.ui.basic.Label("").set({width: 100, textAlign: "right"});
	var lblSubtotD1 = new qx.ui.basic.Label("").set({width: 100, textAlign: "right"});
	
	gbDentro.add(lblSubtotD12, {left: 120, top: 10});
	gbDentro.add(lblSubtotD34, {left: 120, top: 40});
	gbDentro.add(lblSubtotD1, {left: 120, top: 70});
	
	//gbDentro.add(formView2, {left: 0, top: 0});
	this.add(gbDentro, {left: 10, top: 220});
	
	
	var formView3 = new componente.comp.ui.ramon.abstractrenderer.Grid(form, 50, 50, 3);
	var gbFuera = new qx.ui.groupbox.GroupBox("Fuera de provincia");
	gbFuera.setLayout(new qx.ui.layout.Basic())
	gbFuera.add(formView3, {left: 0, top: 0});
	
	var lblSubtotF12 = new qx.ui.basic.Label("").set({width: 100, textAlign: "right"});
	var lblSubtotF34 = new qx.ui.basic.Label("").set({width: 100, textAlign: "right"});
	var lblSubtotF1 = new qx.ui.basic.Label("").set({width: 100, textAlign: "right"});
	
	gbFuera.add(lblSubtotF12, {left: 120, top: 10});
	gbFuera.add(lblSubtotF34, {left: 120, top: 40});
	gbFuera.add(lblSubtotF1, {left: 120, top: 70});
	
	//gbFuera.add(formView3, {left: 0, top: 0});
	this.add(gbFuera, {left: 10, top: 350});
	
	
	var formView4 = new componente.comp.ui.ramon.abstractrenderer.Grid(form, 50, 50, 4);
	this.add(formView4, {left: 280, top: 250});
	
	var formView5 = new componente.comp.ui.ramon.abstractrenderer.Grid(form, 50, 50, 5);
	this.add(formView5, {left: 70, top: 300});
	
	
	var lblTotal = new qx.ui.basic.Label("Total: 0.00");
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
	this.add(groupbox, {right: 10, top: 100});
	

	
	/*
	var formView = new componente.comp.ui.ramon.abstractrenderer.Grid(form, 30, 30, 2);
	this.add(formView, {left: 0, top: 95})
	arrayTabIndex = arrayTabIndex.concat(formView.getChildren());
	*/
	
	
	

	var controllerForm = new qx.data.controller.Form(null, form);
	
	var validationManager = form.getValidationManager();
	validationManager.setValidator(new qx.ui.form.validation.AsyncValidator(function(items, asyncValidator){
		slbMes.setValid(true);
		txtAno.setValid(true);
		var bool = true;
		for (var x = 0; x < items.length; x++) {
			bool = bool && items[x].isValid();
		}
		if (bool) {
			var model = qx.util.Serializer.toNativeObject(modelForm);
			model.id_viatico = id_viatico;
			model.organismo_area_id = organismo_area_id;
			model.fecha_desde2 = new Date(txtAno.getValue(), slbMes.getSelection()[0].getModel() - 1, 1);
			var p = model;
			
			var rpc = new componente.comp.io.ramon.rpc.Rpc("services/", "viaticos.Viaticos_rm");
			rpc.callAsync(function(resultado, error, id){
				strTopeMensual = "";
				bool = true;
				if (resultado.length > 0) {
					for (var x = 0; x < resultado.length; x++) {
						if (resultado[x].descrip == "documentacion_id") {
							bool = false;
							if (estado=="L") {
								dialog.Dialog.error("El asunto no está ubicado en el área correcta.");
							} else {
								txtAsunto.setInvalidMessage(resultado[x].message);
								txtAsunto.setValid(false);
								txtAsunto.focus();
							}
						} else if (resultado[x].descrip == "intervalo") {
							bool = false;
							slbMes.setInvalidMessage(resultado[x].message);
							txtAno.setInvalidMessage(resultado[x].message);
							slbMes.setValid(false);
							txtAno.setValid(false);
							slbMes.focus();
							/*
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
							*/
						} else if (resultado[x].descrip == "porc_tope_cargo") {
							strTopeMensual = "Con el importe de viático $" + numberformatMonto.format(model.subtotal_viatico2) + " se supera tope mensual.";
						}
					}
					if (bool) asyncValidator.setValid(true);
				} else asyncValidator.setValid(true);
			}, "validar_viatico", p);
		} else {
			asyncValidator.setValid(false);
		}
	}));
	
	
	validationManager.addListener("complete", function(e){
		if (validationManager.getValid()) {
			var functionGrabar = function(e) {
				if (e) {
					var aux;
					var model = qx.util.Serializer.toNativeObject(modelForm);
					model.id_viatico = id_viatico;
					model.organismo_area_id = organismo_area_id;
					model.fecha_desde2 = new Date(txtAno.getValue(), slbMes.getSelection()[0].getModel() - 1, 1);
					model.estado = estado;
					aux = {dp12: model.dp12, dp34: model.dp34, dp1: model.dp1, fp12: model.fp12, fp34: model.fp34, fp1: model.fp1};
					json.cant_dias = aux;
					aux = {diario_12_dp: model.diario_12_dp, diario_34_dp: model.diario_34_dp, diario_dp: model.diario_dp, diario_12_fp: model.diario_12_fp, diario_34_fp: model.diario_34_fp, diario_fp: model.diario_fp};
					json.diario = aux;
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
					
					
					var rpc = new componente.comp.io.ramon.rpc.Rpc("services/", "viaticos.Viaticos_rm");
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
	
	var btnAceptar = new qx.ui.form.Button("Aceptar");
	btnAceptar.addListener("execute", function(e){
		//var model = qx.util.Serializer.toNativeObject(modelForm);
		//alert(qx.util.Json.stringify(model, true));
		//alert(slbMes.getSelection()[0].getModel());
		
		form.validate();
	});
	this.add(btnAceptar, {left: 320, bottom: 0});
	
	var btnCancelar = new qx.ui.form.Button("Cancelar");
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
	


	
	var lblSubtotal_viatico2 = new qx.ui.basic.Label("");
	lblSubtotal_viatico2.setTextAlign("right");
	lblSubtotal_viatico2.setWidth(120);
	
	gbDentro.add(new qx.ui.basic.Label("*"), {left: 85, top: 10});
	gbDentro.add(new qx.ui.basic.Label("*"), {left: 85, top: 40});
	gbDentro.add(new qx.ui.basic.Label("*"), {left: 85, top: 70});

	gbFuera.add(new qx.ui.basic.Label("*"), {left: 85, top: 10});
	gbFuera.add(new qx.ui.basic.Label("*"), {left: 85, top: 40});
	gbFuera.add(new qx.ui.basic.Label("*"), {left: 85, top: 70});
	
	this.add(lblSubtotal_viatico2, {left: 122, top: 479});
	
	var preparar_campos = function() {
		var aux = new Date();
		aux = aux.getFullYear() + "-" + (aux.getMonth() + 1) + "-" + aux.getDate();
		
		json = {operaciones: [{fecha: aux, organismo_area: appMain.rowOrganismo_area.label, usuario: appMain._SYSusuario, operacion: "Emisión"}]};
		json.diario = {};
		
		var rpc = new componente.comp.io.ramon.rpc.Rpc("services/", "viaticos.Viaticos");
		try {
			var resultado = rpc.callSync("leer_paramet");
		} catch (ex) {
			alert("Sync exception: " + ex);
		}
		
		json.paramet = resultado[0];

		organismo_area_id = appMain.rowOrganismo_area.organismo_area_id;
		
		cboPersonal.setValue("");
		
		modelForm = controllerForm.createModel(true);
		//var model = qx.util.Serializer.toNativeObject(modelForm);

		//model.id_viatico = "0";
		
		//modelForm = qx.data.marshal.Json.createModel(model);
		//controllerForm.setModel(modelForm);
		
		var model = qx.util.Serializer.toNativeObject(modelForm);
		model.id_viatico = "0";
		
		modelForm = qx.data.marshal.Json.createModel(model);
		controllerForm.setModel(modelForm);
	}
	
	if (id_viatico=="0") {
		this.setCaption("Alta de viático - Reintegro mensual");
		btnAceptar.setLabel("Grabar");
		btnCancelar.setLabel("Cerrar");
		preparar_campos();
	} else {
		var p = {};
		var rpc = new componente.comp.io.ramon.rpc.Rpc("services/", "viaticos.Viaticos_rm");
		try {
			var resultado = rpc.callSync("leer_viatico", id_viatico);
		} catch (ex) {
			alert("Sync exception: " + ex);
		}
		
		
		
		json = qx.lang.Json.parse(resultado.viatico.json);
		
		var aux = new Date();
		aux = aux.getFullYear() + "-" + (aux.getMonth() + 1) + "-" + aux.getDate();
		if (estado == "L") {
			this.setCaption("Liquidación de viático - Reintegro mensual");
			json.operaciones.push({fecha: aux, organismo_area: appMain.rowOrganismo_area.label, usuario: appMain._SYSusuario, operacion: "Liquidar"});
		} else {
			this.setCaption("Modificación de viático - Reintegro mensual");
			json.operaciones.push({fecha: aux, organismo_area: appMain.rowOrganismo_area.label, usuario: appMain._SYSusuario, operacion: "Modificar"});
		}
		
		//organismo_area_id = resultado.viatico.organismo_area_id;
		organismo_area_id = appMain.rowOrganismo_area.organismo_area_id;
		
		for (var x in json.cant_dias) {
			resultado.viatico[x] = json.cant_dias[x];
		}
		
		delete resultado.viatico.json;
		
	
		var listItem;
		//cboOrganismoArea.add(new qx.ui.form.ListItem(resultado.cboOrganismoArea.label, null, resultado.cboOrganismoArea.model));
		listItem = new qx.ui.form.ListItem(resultado.cboPersonal.label, null, resultado.cboPersonal.model);
		listItem.setUserData("datos", resultado.cboPersonal);
		cboPersonal.add(listItem);
		cboMotivo.add(new qx.ui.form.ListItem(resultado.cboMotivo.label, null, resultado.cboMotivo.model));
		cboOrganismoAreaOrigen.add(new qx.ui.form.ListItem(resultado.cboOrganismoAreaOrigen.label, null, resultado.cboOrganismoAreaOrigen.model));

		//if (resultado.cboCtaCte) cboCtaCte.add(new qx.ui.form.ListItem(resultado.cboCtaCte.label, null, resultado.cboCtaCte.model));
		
		
		
		for (var x = 0; x < resultado.localidad.length; x++) {
			listItem = new qx.ui.form.ListItem(resultado.localidad[x].label, null, resultado.localidad[x].model);
			lstLocalidad.add(listItem);
			lstLocalidad.setSelection([listItem]);
		}
		
		//resultado.viatico.cboOrganismoArea = "";
		resultado.viatico.cboOrganismoAreaOrigen = "";
		resultado.viatico.cboPersonal = "";
		resultado.viatico.codigo_002per = parseFloat(resultado.cboPersonal.codigo_002);
		resultado.viatico.cboMotivo = "";
		resultado.viatico.lstLocalidad = listItem.getModel();
		//resultado.viatico.adicional_viatico1 = 0;

		resultado.viatico.ano = parseFloat(resultado.viatico.fecha_desde2.substr(0, 4));
		resultado.viatico.mes = parseFloat(resultado.viatico.fecha_desde2.substr(5, 2));
		
		//alert(qx.util.Json.stringify(resultado, true));
		
		if (resultado.viatico.fecha_cheque != null) {
			var ano, mes, dia;
			ano = parseInt(resultado.viatico.fecha_cheque.substr(0, 4));
			mes = parseInt(resultado.viatico.fecha_cheque.substr(5, 2)) - 1;
			dia = parseInt(resultado.viatico.fecha_cheque.substr(8, 2));
			resultado.viatico.fecha_cheque = new Date(ano, mes, dia);
		}
		//resultado.viatico.cboCtaCte = "";
		
		
		for (var x in json.diario) {
			resultado.viatico[x] = json.diario[x];
		}
		
		resultado.viatico.dummy = "";
		//resultado.viatico.dummy2 = "";
		
		modelForm = qx.data.marshal.Json.createModel(resultado.viatico, true);
		controllerForm.setModel(modelForm);
	}
	
	//lbldiario_12_dp.setValue("* " + numberformatMontoEs.format(json.paramet.diario_12_dp));
	//lbldiario_34_dp.setValue("* " + numberformatMontoEs.format(json.paramet.diario_34_dp));
	//lbldiario_dp.setValue("* " + numberformatMontoEs.format(json.paramet.diario_dp));

	//lbldiario_12_fp.setValue("* " + numberformatMontoEs.format(json.paramet.diario_12_fp));
	//lbldiario_34_fp.setValue("* " + numberformatMontoEs.format(json.paramet.diario_34_fp));
	//lbldiario_fp.setValue("* " + numberformatMontoEs.format(json.paramet.diario_fp));
	
	

	
	
	/*
	var children = groupbox.getChildren();
	for (var x = 0; x < children.length; x++) {
		children[x].setTabIndex(x + 9);
	}
	*/
	
	txtAsunto.setTabIndex(1);
	//cboOrganismoArea.setTabIndex(2);
	cboOrganismoAreaOrigen.setTabIndex(3);
	cboPersonal.setTabIndex(4);
	txtCodigo_002per.setTabIndex(5);
	cboMotivo.setTabIndex(6);
	slbMes.setTabIndex(7);
	txtAno.setTabIndex(8);
	cboLocalidadSel.setTabIndex(9);
	btnAgregarLocalidad.setTabIndex(10);
	btnBorrar.setTabIndex(11);
	lstLocalidad.setTabIndex(12);
	txtDp12.setTabIndex(13);
	txtDp12diario.setTabIndex(14);
	txtDp34.setTabIndex(15);
	txtDp34diario.setTabIndex(16);
	txtDp1.setTabIndex(17);
	txtDp1diario.setTabIndex(18);
	txtFp12.setTabIndex(19);
	txtFp12diario.setTabIndex(20);
	txtFp34.setTabIndex(21);
	txtFp34diario.setTabIndex(22);
	txtFp1.setTabIndex(23);
	txtFp1diario.setTabIndex(24);
	txtSubtotal_alojam2.setTabIndex(25);
	txtPasajes.setTabIndex(26);
	slbCtaCte.setTabIndex(27);
	txtNroCheque.setTabIndex(28);
	dtfFechacheque.setTabIndex(29);
	btnAceptar.setTabIndex(30);
	btnCancelar.setTabIndex(31);
	
	sumar();
	
	
	
	var lstLista = new qx.ui.list.List().set({width: 330, height: 90});
	this.add(lstLista, {left: 490, top: 0});
	

	},
	members : 
	{

	},
	events : 
	{
		"aceptado": "qx.event.type.Event"
	}
});
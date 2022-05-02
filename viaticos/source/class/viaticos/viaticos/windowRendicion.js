qx.Class.define("viaticos.viaticos.windowRendicion",
{
	extend : componente.comp.ui.ramon.window.Window,
	construct : function (appMain, id_viatico, estado)
	{
		this.base(arguments);

	this.set({
		caption: "Rendición",
		width: 630,
		height: 410,
		showMinimize: false,
		showMaximize: false
	});
	this.setLayout(new qx.ui.layout.Canvas());
	
	this.addListenerOnce("appear", function(){
		dtfFechadesde.focus();
	});
	
	
	var contexto = this;
	var modelForm = null;
	var json;
	var regexpHora = new RegExp(/^((0[0-9]|1\d|2[0-3]|[0-9])(:|.)([0-5]\d)){1}$/);
	var numberformatMonto = new qx.util.format.NumberFormat("en").set({groupingUsed: false, maximumFractionDigits: 2, minimumFractionDigits: 2});
	var numberformatMontoEs = new qx.util.format.NumberFormat("es").set({groupingUsed: false, maximumFractionDigits: 2, minimumFractionDigits: 2});
	var strTopeMensual = "";
	var total1;
	var validar_tope = true;
	var eximir_tope_viatico;
	var ultimo_id_viatico = 0;
	
	var sumar = function() {
		txtImporteTotal.setValue(txtSubtotal_viatico2.getValue() + txtSubtotal_alojam2.getValue() + txtCombustible2.getValue() + txtPasajes2.getValue() + txtOtrosgastos2.getValue());
		lblTotal2.setValue(numberformatMontoEs.format(txtImporteTotal.getValue()));
		lblDiferencia.setValue("Diferencia: " + numberformatMontoEs.format(txtImporteTotal.getValue() - total1));
	}
	

	var p = {};
	var rpc = new componente.comp.io.ramon.rpc.Rpc("services/", "viaticos.Viaticos");
	try {
		var resultado = rpc.callSync("leer_viatico", id_viatico);
	} catch (ex) {
		alert("Sync exception: " + ex);
	}
	
	resultado.viatico.eximir_tope_viatico = eximir_tope_viatico = resultado.cboPersonal.eximir_tope_viatico;
	resultado.viatico.codigo_002per = resultado.cboPersonal.codigo_002;
	json = qx.lang.Json.parse(resultado.viatico.json);
	
	var aux = new Date();
	aux = aux.getFullYear() + "-" + (aux.getMonth() + 1) + "-" + aux.getDate();
	json.operaciones.push({fecha: aux, organismo_area: appMain.rowOrganismo_area.label, usuario: appMain._SYSusuario, operacion: "Rendir"});
	
	
	var form = new qx.ui.form.Form();
	
	var dtfFechadesde = new qx.ui.form.DateField();
	dtfFechadesde.setRequired(true);
	form.add(dtfFechadesde, "Fecha desde", null, "fecha_desde2", null, {item: {row: 0, column: 1, colSpan: 4}});
	
	var txtHoradesde = new qx.ui.form.TextField("00:00");
	txtHoradesde.setRequired(true);
	txtHoradesde.setPlaceholder("00:00");
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
	form.add(txtHoradesde, "Hora desde", null, "hora_desde2", null, {item: {row: 0, column: 9, colSpan: 2}, label: {row: 0, column: 6, colSpan: 3}});

	var dtfFechahasta = new qx.ui.form.DateField();
	dtfFechahasta.setRequired(true);
	form.add(dtfFechahasta, "Fecha hasta", null, "fecha_hasta2", null, {item: {row: 1, column: 1, colSpan: 4}});
	
	var txtHorahasta = new qx.ui.form.TextField("00:00");
	txtHorahasta.setRequired(true);
	txtHorahasta.setPlaceholder("00:00");
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
	form.add(txtHorahasta, "Hora hasta", null, "hora_hasta2", null, {item: {row: 1, column: 9, colSpan: 2}, label: {row: 1, column: 6, colSpan: 3}});
	
	
	var txtSubtotal_viatico2 = new qx.ui.form.Spinner(0, 0, 1000000);
	txtSubtotal_viatico2.setNumberFormat(numberformatMonto);
	txtSubtotal_viatico2.addListener("changeValue", sumar);
	form.add(txtSubtotal_viatico2, "Viático", null, "subtotal_viatico2", null, {item: {row: 2, column: 1, colSpan: 4}});
	
	var txtSubtotal_alojam2 = new qx.ui.form.Spinner(0, 0, 1000000);
	txtSubtotal_alojam2.setNumberFormat(numberformatMonto);
	txtSubtotal_alojam2.addListener("changeValue", sumar);
	form.add(txtSubtotal_alojam2, "Alojamiento", null, "subtotal_alojam2", null, {item: {row: 3, column: 1, colSpan: 4}});
	
	var txtCombustible2 = new qx.ui.form.Spinner(0, 0, 1000000);
	txtCombustible2.setNumberFormat(numberformatMonto);
	txtCombustible2.addListener("changeValue", sumar);
	form.add(txtCombustible2, "Combustible", null, "combustible2", null, {item: {row: 4, column: 1, colSpan: 4}});
	
	var txtPasajes2 = new qx.ui.form.Spinner(0, 0, 1000000);
	txtPasajes2.setNumberFormat(numberformatMonto);
	txtPasajes2.addListener("changeValue", sumar);
	form.add(txtPasajes2, "Pasajes", null, "pasajes2", null, {item: {row: 5, column: 1, colSpan: 4}});
	
	var txtOtrosgastos2 = new qx.ui.form.Spinner(0, 0, 1000000);
	txtOtrosgastos2.setNumberFormat(numberformatMonto);
	txtOtrosgastos2.addListener("changeValue", sumar);
	form.add(txtOtrosgastos2, "Otros gastos", null, "otros_gastos2", null, {item: {row: 6, column: 1, colSpan: 4}});
	
	var txtImporteTotal = new qx.ui.form.Spinner(0, 0, 1000000);
	form.add(txtImporteTotal, "Imp.total", null, "importe_total");
	
	
	var formView = new componente.comp.ui.ramon.abstractrenderer.Grid(form, 50, 50);
	
	var controllerForm = new qx.data.controller.Form(null, form);
	
	
	var groupbox1 = new qx.ui.groupbox.GroupBox("Rendido");
	groupbox1.setLayout(new qx.ui.layout.Basic());
	groupbox1.setWidth(390);
	groupbox1.setHeight(290);
	this.add(groupbox1, {right: 0, top: 0});
	
	groupbox1.add(formView, {left: 0, top: 0});
	groupbox1.add(new qx.ui.basic.Label("Total: "), {left: 0, top: 220});
	
	var lblTotal2 = new qx.ui.basic.Label("");
	groupbox1.add(lblTotal2, {left: 90, top: 220});
	
	
	
	var lblDiferencia = new qx.ui.basic.Label("");
	this.add(lblDiferencia, {left: 180, top: 290});
	
	
	
	var groupbox2 = new qx.ui.groupbox.GroupBox("Liquidado");
	groupbox2.setLayout(new qx.ui.layout.Basic());
	groupbox2.setWidth(210);
	groupbox2.setHeight(290);
	this.add(groupbox2, {left: 0, top: 0});
	
	groupbox2.add(new qx.ui.basic.Label("Fecha/hora desde: "), {left: 0, top: 4});
	groupbox2.add(new qx.ui.basic.Label("Fecha/hora hasta: "), {left: 0, top: 32});
	groupbox2.add(new qx.ui.basic.Label("Viático: "), {left: 0, top: 62});
	groupbox2.add(new qx.ui.basic.Label("Alojamiento: "), {left: 0, top: 94});
	groupbox2.add(new qx.ui.basic.Label("Combustible: "), {left: 0, top: 126});
	groupbox2.add(new qx.ui.basic.Label("Pasajes: "), {left: 0, top: 158});
	groupbox2.add(new qx.ui.basic.Label("Otros gastos: "), {left: 0, top: 188});
	groupbox2.add(new qx.ui.basic.Label("Total:"), {left: 0, top: 220});
	

	var lblFechadesde = new qx.ui.basic.Label(resultado.viatico.fecha_desde1 + " " + resultado.viatico.hora_desde1.substr(0, 5));
	groupbox2.add(lblFechadesde, {left: 95, top: 4});
	
	var lblFechahasta = new qx.ui.basic.Label(resultado.viatico.fecha_hasta1 + " " + resultado.viatico.hora_hasta1.substr(0, 5));
	groupbox2.add(lblFechahasta, {left: 95, top: 32});
	
	var lblViatico1 = new qx.ui.basic.Label(numberformatMontoEs.format(resultado.viatico.subtotal_viatico1));
	groupbox2.add(lblViatico1, {left: 95, top: 62});
	
	var lblAlojam1 = new qx.ui.basic.Label(numberformatMontoEs.format(resultado.viatico.subtotal_alojam1));
	groupbox2.add(lblAlojam1, {left: 95, top: 94});
	
	var lblCombustible1 = new qx.ui.basic.Label(numberformatMontoEs.format(resultado.viatico.combustible1));
	groupbox2.add(lblCombustible1, {left: 95, top: 126});
	
	var lblPasajes1 = new qx.ui.basic.Label(numberformatMontoEs.format(resultado.viatico.pasajes1));
	groupbox2.add(lblPasajes1, {left: 95, top: 158});
	
	var lblOtrosgastos1 = new qx.ui.basic.Label(numberformatMontoEs.format(resultado.viatico.otros_gastos1));
	groupbox2.add(lblOtrosgastos1, {left: 95, top: 188});

	total1 = resultado.viatico.subtotal_viatico1 + resultado.viatico.subtotal_alojam1 + resultado.viatico.combustible1 + resultado.viatico.pasajes1 + resultado.viatico.otros_gastos1;
	var lblTotal1 = new qx.ui.basic.Label(numberformatMontoEs.format(total1));
	groupbox2.add(lblTotal1, {left: 95, top: 220});
	
	
	var ano, mes, dia;
	ano = Number(resultado.viatico.fecha_desde2.substr(0, 4));
	mes = Number(resultado.viatico.fecha_desde2.substr(5, 2)) - 1;
	dia = Number(resultado.viatico.fecha_desde2.substr(8, 2));
	resultado.viatico.fecha_desde2 = new Date(ano, mes, dia);
	
	resultado.viatico.hora_desde2 = resultado.viatico.hora_desde2.substr(0, 5);
	
	ano = Number(resultado.viatico.fecha_hasta2.substr(0, 4));
	mes = Number(resultado.viatico.fecha_hasta2.substr(5, 2)) - 1;
	dia = Number(resultado.viatico.fecha_hasta2.substr(8, 2));
	resultado.viatico.fecha_hasta2 = new Date(ano, mes, dia);
	
	resultado.viatico.hora_hasta2 = resultado.viatico.hora_hasta2.substr(0, 5);
	
	modelForm = qx.data.marshal.Json.createModel(resultado.viatico);
	controllerForm.setModel(modelForm);
	
	var validationManager = form.getValidationManager();
	/*
	validationManager.setValidator(function(items){
		var bool = dtfFechadesde.isValid() && dtfFechahasta.isValid() && txtHoradesde.isValid() && txtHorahasta.isValid();
		if (bool) {
			var d = dtfFechadesde.getValue();
			var d = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Number(txtHoradesde.getValue().substr(0, 2)), Number(txtHoradesde.getValue().substr(3, 2)));

			var h = dtfFechahasta.getValue();
			var h = new Date(h.getFullYear(), h.getMonth(), h.getDate(), Number(txtHorahasta.getValue().substr(0, 2)), Number(txtHorahasta.getValue().substr(3, 2)));
			if (h - d < 0) {
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
				
				return false;
			} else {
				dtfFechadesde.setValid(true);
				dtfFechahasta.setValid(true);
				txtHoradesde.setValid(true);
				txtHorahasta.setValid(true);
			}
		}
	});
	*/
	
	validationManager.setValidator(new qx.ui.form.validation.AsyncValidator(function(items, asyncValidator){
		//var bool = txtAsunto.isValid() && cboOrganismoArea.isValid() && dtfFechadesde.isValid() && dtfFechahasta.isValid() && txtHoradesde.isValid() && txtHorahasta.isValid();
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
				
				//asyncValidator.setValid(false);
			} else {
				var model = qx.util.Serializer.toNativeObject(modelForm);
				model.estado = "R";
				//model.subtotal_viatico2 = model.subtotal_viatico1;
				//model.fecha_desde2 = model.fecha_desde1;
				//model.hora_desde2 = model.hora_desde1;
				//model.fecha_hasta2 = model.fecha_hasta1;
				//model.hora_hasta2 = model.hora_hasta1;
				model.json = qx.lang.Json.stringify(json);

				
				var p = {};
				p.model = model;
				p.validar_tope = validar_tope;
				p.localidad = [];
				
				//alert(qx.lang.Json.stringify(p, null, 2));
				
				var rpc = new componente.comp.io.ramon.rpc.Rpc("services/", "viaticos.Viaticos");
				rpc.callAsync(function(resultado, error, id){
					//alert(qx.lang.Json.stringify(error, null, 2));
					//alert(qx.lang.Json.stringify(resultado, null, 2));
					if (resultado.error.length == 1 && resultado.error[0].descrip == "porc_tope_cargo") {
						var aux = "Con el importe de viático $" + numberformatMonto.format(model.subtotal_viatico2) + " se supera tope mensual.";
						if (eximir_tope_viatico) {
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
							if (resultado.error[x].descrip == "intervalo") {
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
								dialog.Dialog.error("El asunto no está ubicado en el área correcta.");
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
	
	
	
	
	
	
	
	
	
	
	
	
	/*
	validationManager.setValidator(new qx.ui.form.validation.AsyncValidator(function(items, asyncValidator){
		//var bool = txtAsunto.isValid() && cboOrganismoArea.isValid() && dtfFechadesde.isValid() && dtfFechahasta.isValid() && txtHoradesde.isValid() && txtHorahasta.isValid();
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
				
				//asyncValidator.setValid(false);
			} else {
				var model = qx.util.Serializer.toNativeObject(modelForm);
				model.estado = "R";
				//model.subtotal_viatico2 = model.subtotal_viatico1;
				//model.fecha_desde2 = model.fecha_desde1;
				//model.hora_desde2 = model.hora_desde1;
				//model.fecha_hasta2 = model.fecha_hasta1;
				//model.hora_hasta2 = model.hora_hasta1;
				model.json = qx.lang.Json.stringify(json);

				
				var p = {};
				p.model = model;
				p.validar_tope = validar_tope;
				p.localidad = [];
				
				var rpc = new componente.comp.io.ramon.rpc.Rpc("services/", "viaticos.Viaticos");
				rpc.callAsync(function(resultado, error, id){
					strTopeMensual = "";
					bool = true;
					
					if (resultado.length > 0) {
						for (var x = 0; x < resultado.length; x++) {
							if (resultado[x].descrip == "intervalo") {
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
							}
						}
						if (bool) asyncValidator.setValid(true);
					} else asyncValidator.setValid(true);
					
					//asyncValidator.setValid(resultado, " Asunto inválido ");
				}, "validar_viatico", p);
			}
		} else {
			asyncValidator.setValid(false);
		}
	}));
	*/
	
	
	
	
	validationManager.addListener("complete", function(e){
		if (validationManager.getValid()) {
			this.fireDataEvent("aceptado", ultimo_id_viatico);
			btnCancelar.fireEvent("execute");
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
					var model = qx.util.Serializer.toNativeObject(modelForm);
					
					//model.fecha_desde2 = model.fecha_desde1;
					//model.hora_desde2 = model.hora_desde1;
					//model.fecha_hasta2 = model.fecha_hasta1;
					//model.hora_hasta2 = model.hora_hasta1;
					//model.cant_dias_viatico2 = model.cant_dias_viatico1;
					//model.adicional_viatico2 = model.adicional_viatico1;
					//model.subtotal_viatico2 = model.subtotal_viatico1;
					//model.cant_dias_alojam2 = model.cant_dias_alojam1;
					//model.subtotal_alojam2 = model.subtotal_alojam1;
					//model.combustible2 = model.combustible1;
					//model.pasajes2 = model.pasajes1;
					//model.otros_gastos2 = model.otros_gastos1;
					
					model.estado = "R";
					
					//model.paramet = qx.util.Json.stringify(paramet);
					
					model.json = qx.lang.Json.stringify(json);

					
					var p = {};
					p.model = model;
					p.localidad = [];
					
					//alert(qx.util.Json.stringify(p, true));
					
					var rpc = new componente.comp.io.ramon.rpc.Rpc("services/", "viaticos.Viaticos");
					try {
						var resultado = rpc.callSync("alta_modifica_viatico", p);
					} catch (ex) {
						alert("Sync exception: " + ex);
					}
					
					//window.open("services/class/viaticos/Impresion.php?rutina=imprimir_rendicion&id_viatico=" + id_viatico);
					contexto.fireDataEvent("aceptado", resultado);
					btnCancelar.fireEvent("execute");
				}
			}
			
			if (strTopeMensual=="" || estado == "L") {
				functionGrabar(true);
			} else {
				(new dialog.Confirm({
				        "message"   : strTopeMensual,
				        "callback"  : functionGrabar,
				        "context"   : contexto,
				        "image"     : "icon/48/status/dialog-warning.png"
				})).show();
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
	/*
	btnAceptar.addListener("execute", function(e){
		if (form.validate()) {
			var model = qx.util.Serializer.toNativeObject(modelForm);
			model.estado = "R";
			var p = {};
			p.model = model;
			
			var rpc = new componente.comp.io.ramon.rpc.Rpc("services/", "viaticos.Viaticos");
			try {
				var resultado = rpc.callSync("rendir_viatico", p);
			} catch (ex) {
				alert("Sync exception: " + ex);
			}

			this.fireDataEvent("aceptado", id_viatico);
			btnCancelar.fireEvent("execute");
		}
	}, this);
	*/
	btnAceptar.addListener("execute", function(e){
		//var model = qx.util.Serializer.toNativeObject(modelForm);
		//alert(qx.util.Json.stringify(model, true));
		
		
		form.validate();
	});
	this.add(btnAceptar, {left: 170, bottom: 0});
	
	var btnCancelar = new qx.ui.form.Button("Cancelar");
	btnCancelar.addListener("execute", function(e){
		this.destroy();
	}, this);
	this.add(btnCancelar, {left: 370, bottom: 0});
	
	
	
	
	sumar();
	
		
	},
	members : 
	{

	},
	events : 
	{
		"aceptado": "qx.event.type.Event"
	}
});
qx.Class.define("viaticos.viaticos.pagePrincipal",
{
	extend : qx.ui.tabview.Page,
	construct : function (application)
	{
		this.base(arguments);
		
		this._application = application;
		
/*
		var rpc = this._rpc = new qx.io.remote.Rpc("services/")
		rpc.setTimeout(10000);
		rpc.setServiceName("pediatras.Principal");
		try {
			var resultado = rpc.callSync("leer_principal");
		} catch (ex) {
			alert("Sync exception: " + ex);
		}
*/
		
		this.setLabel('Principal');
		this.setLayout(new qx.ui.layout.Canvas());
		
	this.addListenerOnce("appear", function(e){
		txtFiltrar.focus();
		actualizarViaticos();
	});
		
		
	var rowDataActual;
	var numberformatMontoEs = new qx.util.format.NumberFormat("es").set({groupingUsed: true, maximumFractionDigits: 2, minimumFractionDigits: 2});
	var numberformatMontoEs2 = new qx.util.format.NumberFormat("es").set({groupingUsed: true});
		
		var actualizarViaticos = function(id_viatico) {
			btnFiltrar.setEnabled(false);
			tableModel.setDataAsMapArray([], true);
			
			var bounds = application.getRoot().getBounds();
			var imageLoading = new qx.ui.basic.Image("viaticos/loading66.gif");
			imageLoading.setBackgroundColor("#FFFFFF");
			imageLoading.setDecorator("main");
			application.getRoot().add(imageLoading, {left: parseInt(bounds.width / 2 - 33), top: parseInt(bounds.height / 2 - 33)});
			
			tblPaciente.setFocusedCell();
			var p = {};
			p.organismo_area_id = application.rowOrganismo_area.organismo_area_id;
			p.filtrar = txtFiltrar.getValue().trim();
			p.desde = txtDesde.getValue();
			p.hasta = txtHasta.getValue();
			
			var rpc = new qx.io.remote.Rpc("services/", "viaticos.Viaticos");
			rpc.setTimeout(1000 * 60 * 1);
			rpc.callAsync(function(resultado, error, id) {
				tableModel.setDataAsMapArray(resultado, true);
				if (resultado.length > 0) {
					tblPaciente.setFocusedCell(0, 0, true);
					if (id_viatico!=null) {
						tblPaciente.buscar("id_viatico", id_viatico);
						tblPaciente.focus();
					} else {
						//tblPaciente.setFocusedCell(0, 0);
					}
				} else btnOperaciones.setEnabled(false);
				
				imageLoading.destroy();
				imageLoading = null;
				
				btnFiltrar.setEnabled(true);
			}, "leer_viaticos", p);
		};
		
		
		var cambiarEstado = function(estado, operacion) {
			var json = qx.lang.Json.parse(rowDataActual.json);
			var aux = new Date();
			aux = aux.getFullYear() + "-" + (aux.getMonth() + 1) + "-" + aux.getDate();
			json.operaciones.push({fecha: aux, organismo_area: application.rowOrganismo_area.label, usuario: application._SYSusuario, operacion: operacion});
			json = qx.lang.Json.stringify(json);
			
			var p = {};
			p.id_viatico = rowDataActual.id_viatico;
			p.estado = estado;
			p.json = json;
			var rpc = new qx.io.remote.Rpc("services/", "viaticos.Viaticos");
			try {
				var resultado = rpc.callSync("estado_viatico", p);
			} catch (ex) {
				alert("Sync exception: " + ex);
			}
			actualizarViaticos(rowDataActual.id_viatico);
		}
		
		
		
		var txtFiltrar = new qx.ui.form.TextField("");
		txtFiltrar.setLiveUpdate(true);
		txtFiltrar.setWidth(200);
		this.add(txtFiltrar, {left: 50, top: 0});
		
		this.add(new qx.ui.basic.Label("Filtrar:"), {left: 0, top: 3});
		
		
		this.add(new qx.ui.basic.Label("Desde:"), {left: 280, top: 3});
		var txtDesde = new qx.ui.form.DateField();
		txtDesde.setWidth(100);
		this.add(txtDesde, {left: 320, top: 0});
		
		this.add(new qx.ui.basic.Label("Hasta:"), {left: 440, top: 3});
		var txtHasta = new qx.ui.form.DateField();
		txtHasta.setWidth(100);
		this.add(txtHasta, {left: 480, top: 0});
		
		var aux = new Date;
		//txtHasta.setValue(aux);
		aux.setMonth(aux.getMonth() - 6);
		txtDesde.setValue(aux);
		
		var btnFiltrar = new qx.ui.form.Button("Aplicar filtro");
		btnFiltrar.addListener("execute", function(e){
			btnModificar.setEnabled(false);
			btnLiquidar.setEnabled(false);
			btnRendir.setEnabled(false);
			btnCerrar.setEnabled(false);
			btnAnular.setEnabled(false);
			btnImpEmision.setEnabled(false);
			btnImpRendicion.setEnabled(false);
			btnOperaciones.setEnabled(false);
			actualizarViaticos();
		});
		this.add(btnFiltrar, {left: 600, top: 0});
		
		
		//Menu de contexto
		
		var menutblPaciente = new componente.comp.ui.ramon.menu.Menu();
		var btn1 = new qx.ui.menu.Button("Anticipo");
		btn1.addListener("execute", function(e) {
			var win = new viaticos.viaticos.windowViatico(application, "0", "A", "E");
			win.addListener("aceptado", function(e){
				var id_viatico = e.getData();
				actualizarViaticos(id_viatico);
				window.open("services/class/viaticos/Impresion.php?rutina=imprimir_viatico&id_viatico=" + id_viatico);
			});
			win.setModal(true);
			application.getRoot().add(win);
			win.open();
			win.center();
		});
		var btn2 = new qx.ui.menu.Button("Reintegro");
		btn2.addListener("execute", function(e) {
			var win = new viaticos.viaticos.windowViatico(application, "0", "R", "E");
			win.addListener("aceptado", function(e){
				var id_viatico = e.getData();
				actualizarViaticos(id_viatico);
				window.open("services/class/viaticos/Impresion.php?rutina=imprimir_viatico&id_viatico=" + id_viatico);
			});
			win.setModal(true);
			application.getRoot().add(win);
			win.open();
			win.center();
		});
		var btn3 = new qx.ui.menu.Button("Reintegro mensual");
		btn3.addListener("execute", function(e) {
			var win = new viaticos.viaticos.windowViatMen(application, "0", "M", "E");
			win.addListener("aceptado", function(e){
				var id_viatico = e.getData();
				actualizarViaticos(id_viatico);
				window.open("services/class/viaticos/Impresion.php?rutina=imprimir_viatico&id_viatico=" + id_viatico);
			});
			win.setModal(true);
			application.getRoot().add(win);
			win.open();
			win.center();
		});
		menutblPaciente.add(btn1);
		menutblPaciente.add(btn2);
		menutblPaciente.add(btn3);

		var mnubtnNuevo = new qx.ui.form.MenuButton("Nuevo viatico", null, menutblPaciente);
		mnubtnNuevo.setVisibility((application.rowOrganismo_area.perfiles["037007"]==null) ? "visible" : "hidden");
		this.add(mnubtnNuevo, {left: 0, bottom: 0});
		
		var btnModificar = new qx.ui.form.Button("Modificar");
		btnModificar.setVisibility((application.rowOrganismo_area.perfiles["037007"]==null) ? "visible" : "hidden");
		btnModificar.setEnabled(false);
		btnModificar.addListener("execute", function(e){
			if (rowDataActual.tipo_viatico == "M") {
				var win = new viaticos.viaticos.windowViatMen(application, rowDataActual.id_viatico, rowDataActual.tipo_viatico, rowDataActual.estado);
			} else {
				var win = new viaticos.viaticos.windowViatico(application, rowDataActual.id_viatico, rowDataActual.tipo_viatico, rowDataActual.estado);
			}
			win.addListener("aceptado", function(e){
				var id_viatico = e.getData();
				actualizarViaticos(id_viatico);
				window.open("services/class/viaticos/Impresion.php?rutina=imprimir_viatico&id_viatico=" + id_viatico);
			});
			win.setModal(true);
			application.getRoot().add(win);
			win.open();
			win.center();
		});
		this.add(btnModificar, {left: 150, bottom: 0});
		
		var btnLiquidar = new qx.ui.form.Button("Liquidar");
		btnLiquidar.setVisibility((application.rowOrganismo_area.perfiles["037007"]==null) ? "visible" : "hidden");
		btnLiquidar.setEnabled(false);
		btnLiquidar.addListener("execute", function(e){
			if (rowDataActual.tipo_viatico == "M") {
				var window = new viaticos.viaticos.windowViatMen(application, rowDataActual.id_viatico, rowDataActual.tipo_viatico, "L");
			} else {
				var window = new viaticos.viaticos.windowViatico(application, rowDataActual.id_viatico, rowDataActual.tipo_viatico, "L");
			}
			
			window.addListener("aceptado", function(e){
				actualizarViaticos(e.getData());
			});
			window.setModal(true);
			application.getRoot().add(window);
			window.open();
			window.center();
		});
		this.add(btnLiquidar, {left: 300, bottom: 0});
		
		var btnRendir = new qx.ui.form.Button("Rendir");
		btnRendir.setVisibility((application.rowOrganismo_area.perfiles["037007"]==null) ? "visible" : "hidden");
		btnRendir.setEnabled(false);
		btnRendir.addListener("execute", function(e){
			var win = new viaticos.viaticos.windowRendicion(application, rowDataActual.id_viatico);
			win.addListener("aceptado", function(e){
				var id_viatico = e.getData();
				actualizarViaticos(id_viatico);
				window.open("services/class/viaticos/Impresion.php?rutina=imprimir_rendicion&id_viatico=" + id_viatico);
			});
			win.setModal(true);
			application.getRoot().add(win);
			win.open();
			win.center();
		});
		this.add(btnRendir, {left: 400, bottom: 0});
		
		var btnCerrar = new qx.ui.form.Button("Cerrar");
		btnCerrar.setVisibility((application.rowOrganismo_area.perfiles["037007"]==null) ? "visible" : "hidden");
		btnCerrar.setEnabled(false);
		btnCerrar.addListener("execute", function(e){
			dialog.Dialog.confirm("ATENCIÓN: Desea cerrar el viático seleccionado?", function(e){
				if (e) {
					cambiarEstado("C", "Cerrar");
				}
			});
		});
		this.add(btnCerrar, {left: 500, bottom: 0});
		
		var btnAnular = new qx.ui.form.Button("Anular");
		btnAnular.setVisibility((application.rowOrganismo_area.perfiles["037007"]==null) ? "visible" : "hidden");
		btnAnular.setEnabled(false);
		btnAnular.addListener("execute", function(e){
			dialog.Dialog.confirm("ATENCIÓN: Desea anular el viático seleccionado?", function(e){
				if (e) {
					cambiarEstado("A", "Anular");
				}
			});
		});
		this.add(btnAnular, {left: 600, bottom: 0});
		

		
		

		var menuEstado = new componente.comp.ui.ramon.menu.Menu();

		var btnEstadoE = new qx.ui.menu.Button("Emitido");
		btnEstadoE.addListener("execute", function(e) {
			cambiarEstado("E", "Cambio estado");
		});
		var btnEstadoL = new qx.ui.menu.Button("Liquidado");
		btnEstadoL.addListener("execute", function(e) {
			cambiarEstado("L", "Cambio estado");
		});
		var btnEstadoR = new qx.ui.menu.Button("Rendido");
		btnEstadoR.addListener("execute", function(e) {
			cambiarEstado("R", "Cambio estado");
		});
		var btnEstadoC = new qx.ui.menu.Button("Cerrado");
		btnEstadoC.addListener("execute", function(e) {
			cambiarEstado("C", "Cambio estado");
		});
		var btnEstadoA = new qx.ui.menu.Button("Anulado");
		btnEstadoA.addListener("execute", function(e) {
			cambiarEstado("A", "Cambio estado");
		});

		menuEstado.add(btnEstadoE);
		menuEstado.add(btnEstadoL);
		menuEstado.add(btnEstadoR);
		menuEstado.add(btnEstadoC);
		menuEstado.add(btnEstadoA);

		var mnubtnEstado = new qx.ui.form.MenuButton("Cambiar estado", null, menuEstado);
		if (application.rowOrganismo_area.perfiles["037005"]==null) mnubtnEstado.setVisibility("excluded");
		this.add(mnubtnEstado, {right: 250, bottom: 0});
		
		
		
		
		
		
		
		
		var menuImprimir = new componente.comp.ui.ramon.menu.Menu();
		var btnImpEmision = new qx.ui.menu.Button("Emisión");
		btnImpEmision.setEnabled(false);
		btnImpEmision.addListener("execute", function(e) {
			window.open("services/class/viaticos/Impresion.php?rutina=imprimir_viatico&id_viatico=" + rowDataActual.id_viatico);
		});
		var btnImpRendicion = new qx.ui.menu.Button("Rendición");
		btnImpRendicion.setEnabled(false);
		btnImpRendicion.addListener("execute", function(e) {
			window.open("services/class/viaticos/Impresion.php?rutina=imprimir_rendicion&id_viatico=" + rowDataActual.id_viatico);
		});

		menuImprimir.add(btnImpEmision);
		menuImprimir.add(btnImpRendicion);

		var mnubtnImprimir = new qx.ui.form.MenuButton("Imprimir", null, menuImprimir);
		this.add(mnubtnImprimir, {right: 150, bottom: 0});
		
		
		
		
		
		
		
		
		
		
		
		var btnOperaciones = new qx.ui.form.Button("Operaciones");
		btnOperaciones.setEnabled(false);
		btnOperaciones.addListener("execute", function(e){
			var popup = new viaticos.viaticos.popupOperaciones(qx.lang.Json.parse(rowDataActual.json).operaciones);
			popup.placeToWidget(btnOperaciones);
			popup.show();
		});
		this.add(btnOperaciones, {right: 0, bottom: 0});
	
		
		//Tabla

		
		var tableModel = new qx.ui.table.model.Simple();
		tableModel.setColumns(["Asunto", "F.trámite", "Org/Area", "Org/Area origen", "Apellido nombre", "Imp.total", "Tipo", "Estado"], ["documentacion_id", "fecha_tramite", "organismo_area", "organismo_area_origen", "apenom", "importe_total", "tipo_descrip", "estado_descrip"]);
		//tableModel.setDataAsMapArray(resultado.contacto, true);
		tableModel.addListener("dataChanged", function(e){
			var rowCount = tableModel.getRowCount();
			if (rowCount > 0) tblPaciente.setAdditionalStatusBarText(numberformatMontoEs2.format(rowCount) + " item/s"); else tblPaciente.setAdditionalStatusBarText(" ");
		});

		var custom = {tableColumnModel : function(obj) {
			return new qx.ui.table.columnmodel.Resize(obj);
		}};
		
		var tblPaciente = this._tblPaciente = new componente.comp.ui.ramon.table.Table(tableModel, custom);
		//var tblPaciente = this._tblPaciente = new pediatras.controles.table.Table(tableModel, custom);
		tblPaciente.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
		tblPaciente.toggleColumnVisibilityButtonVisible();
		tblPaciente.toggleShowCellFocusIndicator();
		//tblPaciente.toggleStatusBarVisible();

		tblPaciente.addListener("cellDblclick", function(e){

		});
		
		
		var tableColumnModel = tblPaciente.getTableColumnModel();
		
		var renderer = new qx.ui.table.cellrenderer.Number();
		renderer.setNumberFormat(numberformatMontoEs);
		tableColumnModel.setDataCellRenderer(5, renderer);

		
		
	
		//tableColumnModel.setColumnVisible(0, false);
      // Obtain the behavior object to manipulate
		var resizeBehavior = tableColumnModel.getBehavior();
		resizeBehavior.set(0, {width:"6.5%", minWidth:100});
		resizeBehavior.set(1, {width:"7.5%", minWidth:100});
		resizeBehavior.set(2, {width:"23%", minWidth:100});
		resizeBehavior.set(3, {width:"25%", minWidth:100});
		resizeBehavior.set(4, {width:"17%", minWidth:100});
		resizeBehavior.set(5, {width:"7%", minWidth:100});
		resizeBehavior.set(6, {width:"7%", minWidth:100});
		resizeBehavior.set(7, {width:"7%", minWidth:100});
		
		
		
		
		var selectionModel = tblPaciente.getSelectionModel();
		selectionModel.addListener("changeSelection", function(){
			var bool = (! selectionModel.isSelectionEmpty());
			if (bool) {
				//btnImprimir.setEnabled(true);
				btnOperaciones.setEnabled(true);
				rowDataActual = tableModel.getRowData(tblPaciente.getFocusedRow());
				
				var rpc = new qx.io.remote.Rpc("services/", "viaticos.Viaticos");
				try {
					var resultado = rpc.callSync("leer_operaciones", {id_viatico: rowDataActual.id_viatico});
				} catch (ex) {
					alert("Sync exception: " + ex);
				}
				rowDataActual.json = resultado.json;
				
				//rpc.callAsync(function(resultado, error, id){
				//	rowDataActual.json = resultado.json;
				//}, "leer_operaciones", {id_viatico: rowDataActual.id_viatico});
				
				
				if (rowDataActual.tipo_viatico == "A") {
					if (rowDataActual.estado == "E") {
						btnModificar.setEnabled(true);
						btnLiquidar.setEnabled(application.rowOrganismo_area.perfiles["037002"]!=null);
						btnRendir.setEnabled(false);
						btnCerrar.setEnabled(false);
						btnAnular.setEnabled(true);
						btnImpEmision.setEnabled(true);
						btnImpRendicion.setEnabled(false);
					} else if (rowDataActual.estado == "L") {
						btnModificar.setEnabled(false);
						btnLiquidar.setEnabled(false);
						btnRendir.setEnabled(true);
						btnCerrar.setEnabled(false);
						btnAnular.setEnabled(false);
						btnImpEmision.setEnabled(true);
						btnImpRendicion.setEnabled(false);
					} else if (rowDataActual.estado == "R") {
						btnModificar.setEnabled(false);
						btnLiquidar.setEnabled(false);
						btnRendir.setEnabled(false);
						btnCerrar.setEnabled(true);
						btnAnular.setEnabled(false);
						btnImpEmision.setEnabled(true);
						btnImpRendicion.setEnabled(true);
					} else {
						btnModificar.setEnabled(false);
						btnLiquidar.setEnabled(false);
						btnRendir.setEnabled(false);
						btnCerrar.setEnabled(false);
						btnAnular.setEnabled(false);
						btnImpEmision.setEnabled(true);
						btnImpRendicion.setEnabled(true);
					}
				} else if (rowDataActual.tipo_viatico == "R") {
					if (rowDataActual.estado == "E") {
						btnModificar.setEnabled(true);
						btnLiquidar.setEnabled(application.rowOrganismo_area.perfiles["037002"]!=null);
						btnRendir.setEnabled(false);
						btnCerrar.setEnabled(false);
						btnAnular.setEnabled(true);
						btnImpEmision.setEnabled(true);
						btnImpRendicion.setEnabled(false);
					} else if (rowDataActual.estado == "L") {
						btnModificar.setEnabled(false);
						btnLiquidar.setEnabled(false);
						btnRendir.setEnabled(false);
						btnCerrar.setEnabled(true);
						btnAnular.setEnabled(false);
						btnImpEmision.setEnabled(true);
						btnImpRendicion.setEnabled(false);
					} else {
						btnModificar.setEnabled(false);
						btnLiquidar.setEnabled(false);
						btnRendir.setEnabled(false);
						btnCerrar.setEnabled(false);
						btnAnular.setEnabled(false);
						btnImpEmision.setEnabled(true);
						btnImpRendicion.setEnabled(false);
					}
				} else if (rowDataActual.tipo_viatico == "M") {
					if (rowDataActual.estado == "E") {
						btnModificar.setEnabled(true);
						btnLiquidar.setEnabled(application.rowOrganismo_area.perfiles["037002"]!=null);
						btnRendir.setEnabled(false);
						btnCerrar.setEnabled(false);
						btnAnular.setEnabled(true);
						btnImpEmision.setEnabled(true);
						btnImpRendicion.setEnabled(false);
					} else if (rowDataActual.estado == "L") {
						btnModificar.setEnabled(false);
						btnLiquidar.setEnabled(false);
						btnRendir.setEnabled(false);
						btnCerrar.setEnabled(true);
						btnAnular.setEnabled(false);
						btnImpEmision.setEnabled(true);
						btnImpRendicion.setEnabled(false);
					} else {
						btnModificar.setEnabled(false);
						btnLiquidar.setEnabled(false);
						btnRendir.setEnabled(false);
						btnCerrar.setEnabled(false);
						btnAnular.setEnabled(false);
						btnImpEmision.setEnabled(true);
						btnImpRendicion.setEnabled(false);
					}
				}
			}
			//commandAbrirHC.setEnabled(bool);
			//menutblPaciente.memorizar([commandAbrirHC]);
		});
		
		
		
		this.add(tblPaciente, {left: 0, top: 27, right: 0, bottom: 30});
		
	
		
		
		txtFiltrar.setTabIndex(1);
		txtDesde.setTabIndex(2);
		txtHasta.setTabIndex(3);
		btnFiltrar.setTabIndex(4);
		tblPaciente.setTabIndex(5);
		
		//tblPaciente.setContextMenu(menutblPaciente);
		//tblPaciente.focus();
		
	},
	members : 
	{
		_application: null,
		_rpc: null,
		_tblPaciente: null
		
		
	}
});
qx.Class.define("viaticos.viaticos.windowParamet",
{
	extend : componente.comp.ui.ramon.window.Window,
	construct : function (appMain)
	{
		this.base(arguments);

	this.set({
		caption: "Parámetros",
		width: 390,
		height: 310,
		showMinimize: false,
		showMaximize: false
	});
	this.setLayout(new qx.ui.layout.Canvas());
	
	this.addListenerOnce("appear", function(){
		//btnAceptar.focus();
		//txtDiario_dp.getChildControl("textfield").selectAllText();
		txtDiario_dp.focus();
	});
	
	var numberformatMonto = new qx.util.format.NumberFormat("en").set({groupingUsed: false, maximumFractionDigits: 2, minimumFractionDigits: 2});
		
	var spinner;
	var modelForm = null;
	var form = new qx.ui.form.Form();
	
	var txtDiario_dp = new qx.ui.form.Spinner(0, 0, 10000);
	txtDiario_dp.setNumberFormat(numberformatMonto);
	txtDiario_dp.setWidth(90);
	form.add(txtDiario_dp, "Viat.diario dp", null, "diario_dp", null, {item: {row: 1, column: 1, colSpan: 3}});
	
	spinner = new qx.ui.form.Spinner(0, 0, 10000);
	spinner.setNumberFormat(numberformatMonto);
	spinner.setWidth(90);
	form.add(spinner, "Viat.diario fp", null, "diario_fp", null, {item: {row: 1, column: 6, colSpan: 3}});
	
	spinner = new qx.ui.form.Spinner(0, 0, 10000);
	spinner.setNumberFormat(numberformatMonto);
	form.add(spinner, "Viat. 1/2 dp", null, "diario_12_dp", null, {item: {row: 2, column: 1, colSpan: 3}});
	
	spinner = new qx.ui.form.Spinner(0, 0, 10000);
	spinner.setNumberFormat(numberformatMonto);
	form.add(spinner, "Viat. 1/2 fp", null, "diario_12_fp", null, {item: {row: 2, column: 6, colSpan: 3}});
	
	spinner = new qx.ui.form.Spinner(0, 0, 10000);
	spinner.setNumberFormat(numberformatMonto);
	form.add(spinner, "Viat. 3/4 dp", null, "diario_34_dp", null, {item: {row: 3, column: 1, colSpan: 3}});
	
	spinner = new qx.ui.form.Spinner(0, 0, 10000);
	spinner.setNumberFormat(numberformatMonto);
	form.add(spinner, "Viat. 3/4 fp", null, "diario_34_fp", null, {item: {row: 3, column: 6, colSpan: 3}});
	
	spinner = new qx.ui.form.Spinner(0, 0, 10000);
	spinner.setNumberFormat(numberformatMonto);
	form.add(spinner, "Aloj.emp.dp", null, "alojam_emp_dp", null, {item: {row: 4, column: 1, colSpan: 3}});
	
	spinner = new qx.ui.form.Spinner(0, 0, 10000);
	spinner.setNumberFormat(numberformatMonto);
	form.add(spinner, "Aloj.emp.fp", null, "alojam_emp_fp", null, {item: {row: 4, column: 6, colSpan: 3}});
	
	spinner = new qx.ui.form.Spinner(0, 0, 10000);
	spinner.setNumberFormat(numberformatMonto);
	form.add(spinner, "Aloj.emp.dp.sf", null, "alojam_emp_dp_sf", null, {item: {row: 5, column: 1, colSpan: 3}});

	spinner = new qx.ui.form.Spinner(0, 0, 10000);
	spinner.setNumberFormat(numberformatMonto);
	form.add(spinner, "Aloj.fun.dp", null, "alojam_func_dp", null, {item: {row: 6, column: 1, colSpan: 3}});
	
	spinner = new qx.ui.form.Spinner(0, 0, 10000);
	spinner.setNumberFormat(numberformatMonto);
	form.add(spinner, "Aloj.fun.fp", null, "alojam_func_fp", null, {item: {row: 6, column: 6, colSpan: 3}});
	
	spinner = new qx.ui.form.Spinner(0, 0, 200);
	spinner.setNumberFormat(numberformatMonto);
	form.add(spinner, "Porc.fun. %", null, "porc_func", null, {item: {row: 7, column: 1, colSpan: 3}});
	
	spinner = new qx.ui.form.Spinner(0, 0, 200);
	spinner.setNumberFormat(numberformatMonto);
	form.add(spinner, "Porc.tope %", null, "porc_tope_cargo", null, {item: {row: 7, column: 6, colSpan: 3}});
	

	//var formView = new qx.ui.form.renderer.Double(form);
	var formView = new componente.comp.ui.ramon.abstractrenderer.Grid(form, 10, 15);
	this.add(formView, {left: 10, top: 0})

	var controllerForm = new qx.data.controller.Form(null, form);
	
	

	var commandEsc = new qx.ui.command.Command("Esc");
	this.registrarCommand(commandEsc);
	commandEsc.addListener("execute", function(e){
		btnCancelar.fireEvent("execute");
	});
	
	var btnAceptar = new qx.ui.form.Button("Aceptar");
	btnAceptar.addListener("execute", function(e){
		var model = qx.util.Serializer.toNativeObject(modelForm);
		var rpc = new qx.io.remote.Rpc("services/", "viaticos.Viaticos");
		try {
			var resultado = rpc.callSync("escribir_paramet", model);
		} catch (ex) {
			alert("Sync exception: " + ex);
		}

		btnCancelar.fireEvent("execute");
	}, this);

	var btnCancelar = new qx.ui.form.Button("Cancelar");
	btnCancelar.addListener("execute", function(e){
		this.destroy();
	}, this);
	
	this.add(btnAceptar, {left: 90, bottom: 0});
	this.add(btnCancelar, {left: 230, bottom: 0});
	

	var rpc = new qx.io.remote.Rpc("services/", "viaticos.Viaticos");
	try {
		var resultado = rpc.callSync("leer_paramet");
	} catch (ex) {
		alert("Sync exception: " + ex);
	}
	
	modelForm = qx.data.marshal.Json.createModel(resultado[0]);
	controllerForm.setModel(modelForm);
		
		
	},
	members : 
	{

	}
});
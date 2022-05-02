/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/**
 * This is the main application class of your custom application "viaticos"
 *
 * @asset(viaticos/*)
 */
qx.Class.define("viaticos.Application",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     * 
     * @lint ignoreDeprecated(alert)
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */


      
      
      this.getRoot().set({
			blockerColor: '#bfbfbf',
			blockerOpacity: 0.6
		});
		
		var doc = this.getRoot();
		
		var rpc = new componente.comp.io.ramon.rpc.Rpc();
		rpc.setTimeout(10000);
		rpc.setUrl("services/");
		rpc.setServiceName("viaticos.turnos.login");
		try
		{
			var params = new Object();
			params.version = "3.1.449";
			
			//var result = rpc.callSync("Logueado", params);
			var result = false;

			if (!result) {
				viaticos.Application.Login("Identificacion de Usuario", "", this._InitAPP, this);
			} else {
				this._SYSusuario = result.usuario;
				this.rowOrganismo_area = result.organismo_area;
				this._InitAPP();
			}
		}
		catch (ex)
		{
			alert(ex);
		}
    },
	_InitAPP : function ()
	{
	var doc = this.getRoot();

	var contenedorMain = new qx.ui.container.Composite(new qx.ui.layout.Grow());
	var tabviewMain = this._tabviewMain = new qx.ui.tabview.TabView();
	
	var pagePrincipal = this._pagePrincipal = new viaticos.viaticos.pagePrincipal(this);
	tabviewMain.add(pagePrincipal);
	
	contenedorMain.add(tabviewMain);
	
	
	var mnuArchivo = new qx.ui.menu.Menu();
	var btnAcercaDe = new qx.ui.menu.Button("Acerca de...");
	btnAcercaDe.addListener("execute", function(){

	});
	mnuArchivo.add(btnAcercaDe);
	
	var mnuEdicion = new qx.ui.menu.Menu();
	var btnMotivos = new qx.ui.menu.Button("Motivos");
	btnMotivos.setEnabled(this.rowOrganismo_area.perfiles["037003"]!=null);
	btnMotivos.addListener("execute", function(e){
		var window = new viaticos.viaticos.windowMotivos(this);
		window.setModal(true);
		doc.add(window);
		window.center();
		window.open();
	}, this);
	mnuEdicion.add(btnMotivos);
	
	var btnParamet = new qx.ui.menu.Button("Parámetros");
	btnParamet.setEnabled(this.rowOrganismo_area.perfiles["037003"]!=null);
	btnParamet.addListener("execute", function(e){
		var window = new viaticos.viaticos.windowParamet(this);
		window.setModal(true);
		doc.add(window);
		window.center();
		window.open();
	}, this);
	mnuEdicion.add(btnParamet);
	
	var btnCtaCte = new qx.ui.menu.Button("Cta.Cte.");
	btnCtaCte.setEnabled(this.rowOrganismo_area.perfiles["037003"]!=null);
	btnCtaCte.addListener("execute", function(e){
		var window = new viaticos.viaticos.windowCtaCte(this);
		window.setModal(true);
		doc.add(window);
		window.center();
		window.open();
	}, this);
	mnuEdicion.add(btnCtaCte);
	
	
	var btnPersonal = new qx.ui.menu.Button("Personal");
	btnPersonal.setEnabled(this.rowOrganismo_area.perfiles["037006"]!=null);
	btnPersonal.addListener("execute", function(e){
		var window = new viaticos.viaticos.windowPersonal(this);
		window.setModal(true);
		doc.add(window);
		window.center();
		window.open();
	}, this);
	mnuEdicion.add(btnPersonal);
	
	  
	var mnuVer = new qx.ui.menu.Menu();

	var btnConsultas = new qx.ui.menu.Button("Consultas");
	btnConsultas.setEnabled(this.rowOrganismo_area.perfiles["037004"]!=null);
	btnConsultas.addListener("execute", function(e){
		var window = new viaticos.viaticos.windowConsultas(this);
		window.setModal(true);
		doc.add(window);
		window.center();
		window.open();
	}, this);
	mnuVer.add(btnConsultas);
	
	
	var mnuSesion = new qx.ui.menu.Menu();

	var btnCerrar = new qx.ui.menu.Button("Cerrar");
	btnCerrar.addListener("execute", function(e){
		var rpc = new componente.comp.io.ramon.rpc.Rpc();
		rpc.setTimeout(10000);
		rpc.setUrl("services/");
		rpc.setServiceName("viaticos.turnos.login");
		var result = rpc.callSync("Logout");
		location.reload(true);
		//viaticos.Application.Login("Identificacion de Usuario", "", this._InitAPP, this);
	}, this);
	mnuSesion.add(btnCerrar);
	
	
	var mnubtnArchivo = new qx.ui.toolbar.MenuButton('Archivo');
	var mnubtnEdicion = new qx.ui.toolbar.MenuButton('Edición');
	var mnubtnVer = new qx.ui.toolbar.MenuButton('Ver');
	var mnubtnSesion = new qx.ui.toolbar.MenuButton('Sesión');
	
	mnubtnArchivo.setMenu(mnuArchivo);
	mnubtnEdicion.setMenu(mnuEdicion);
	mnubtnVer.setMenu(mnuVer);
	mnubtnSesion.setMenu(mnuSesion);
	  
	var toolbarMain = new qx.ui.toolbar.ToolBar();
	toolbarMain.add(mnubtnArchivo);
	toolbarMain.add(mnubtnEdicion);
	toolbarMain.add(mnubtnVer);
	toolbarMain.add(mnubtnSesion);
	
	doc.add(toolbarMain, {left: 5, top: 5, right: "50%"});
	
	doc.add(new qx.ui.basic.Label("Org/Area: " + this.rowOrganismo_area.label), {left: "51%", top: 5});
	doc.add(new qx.ui.basic.Label("Usuario: " + this._SYSusuario), {left: "51%", top: 25});
	
	doc.add(contenedorMain, {left: 0, top: 38, right: 0, bottom: 0});
	}
  },
	statics :
	{
		Login : function (title, usuario, functionClose, context)
		{
			var winLogin = new qx.ui.window.Window(title);
			winLogin.addListener("resize", winLogin.center, winLogin);
			winLogin.set({showMaximize:false, allowMaximize:false, showMinimize:false, showClose:false, modal:true, movable:false, resizable:false, showStatusbar:false});
			winLogin.setLayout(new qx.ui.layout.Basic());
			
			/*
			var txtUsuario = new qx.ui.form.ow.TextField("Usuario:").set({enabled:true});
				txtUsuario.getLabel().setWidth(60);
			var txpPassword = new qx.ui.form.ow.PassField("Password:").set({enabled:true});
				txpPassword.getLabel().setWidth(60);
			var lblMSJ = new qx.ui.basic.Label("").set({rich:true, textAlign:'center', visibility:'excluded'});
			var btnIngresar = new qx.ui.form.Button("Validar Datos");
			var cmbServicios = new qx.ui.form.ow.ComboBox("Servicio:").set({visibility:'hidden'});
				cmbServicios.getLabel().setWidth(60);
				cmbServicios.getCombo().setWidth(500);
			*/
			
			var txtUsuario = new qx.ui.form.TextField("");

			var txpPassword = new qx.ui.form.PasswordField("");

			var lblMSJ = new qx.ui.basic.Label("").set({rich:true, textAlign:'center', visibility:'excluded'});
			var btnIngresar = new qx.ui.form.Button("Validar Datos");
			//var cmbServicios = new qx.ui.form.ComboBox().set({visibility:'hidden', width: 400});
			var cmbServicios = new qx.ui.form.SelectBox().set({visibility:'hidden', width: 400});

			
			if ((usuario != "") && (usuario != null) && (usuario != undefined))
			{
				txtUsuario.setValue(usuario);
				txtUsuario.setEnabled(false);
			}
			
			txtUsuario.addListener("keydown", function (e)
			{
				if (e.getKeyIdentifier() === 'Enter')
					txpPassword.tabFocus();
			}, this);
			
			txpPassword.addListener("keydown", function (e)
			{
				if (e.getKeyIdentifier() === 'Enter')
					btnIngresar.execute();
			}, this);
			
			winLogin.add(new qx.ui.basic.Label("Usuario:"), {left:0, top:0});
			winLogin.add(txtUsuario, {left:150, top:0});
			winLogin.add(new qx.ui.basic.Label("Password:"), {left:0, top:30});
			winLogin.add(txpPassword, {left:150, top:30});
			winLogin.add(lblMSJ, {left:200, top:60});
			winLogin.add(new qx.ui.basic.Label("Servicio:"), {left:0, top:60});
			winLogin.add(cmbServicios, {left:150, top:60});
			winLogin.add(btnIngresar, {left:250, top:90});
			
			if ((usuario != "") && (usuario != null) && (usuario != undefined))
			{
				var btnSalir = new qx.ui.form.Button("Salir e Ingresar con otro Usuario");
				btnSalir.addListener("execute", function ()
				{
					location.reload(true);
				});
				winLogin.add(btnSalir);
			}
			
			btnIngresar.addListener("execute", function (e)
			{
				var rpc = new componente.comp.io.ramon.rpc.Rpc();
				rpc.setTimeout(10000);
				rpc.setUrl("services/");
				rpc.setServiceName("viaticos.turnos.login");
				var params = new Object();
				params.usuario = txtUsuario.getValue();
				params.password = txpPassword.getValue();
				//params.servicio = cmbServicios.getValue();
				params.servicio = "";
				try
				{
					if (btnIngresar.getLabel() != "Ingresar")
					{
						var result = rpc.callSync("Login", params);
						if (result.login == true)
						{
							txtUsuario.setEnabled(false);
							txpPassword.setEnabled(false);
							lblMSJ.setVisibility("excluded");
							lblMSJ.setValue("");
							cmbServicios.setVisibility("visible");
							//alert(qx.lang.Json.stringify(result));
							//cmbServicios.setNewValues(result.servicios);
							//alert(qx.lang.Json.stringify(result.servicios, null, 2));
							for (var x in result.servicios) {
								cmbServicios.add(new qx.ui.form.ListItem(result.servicios[x].label, result.servicios[x].icon, result.servicios[x]));
							}
							btnIngresar.setLabel("Ingresar");
						}
						else
						{
							if (result)
							{
								cmbServicios.setVisibility("hidden");
								lblMSJ.setValue("<font color='red'>Ud. no posee permisos para este Sistema.!</font>");
								lblMSJ.setVisibility("visible");
							}
							else
							{
								cmbServicios.setVisibility("hidden");
								lblMSJ.setValue("<font color='red'>Usuario y/o Password incorrecta!</font>");
								lblMSJ.setVisibility("visible");
							}
							if ((usuario != "") && (usuario != null) && (usuario != undefined))
							{
								txpPassword.focus();
							}
							else
							{
								txtUsuario.focus();
							}
						}
					}
					else
					{
						//context.rowOrganismo_area = qx.util.Serializer.toNativeObject(cmbServicios.getChildControl("list").getModelSelection().getItem(0));
						context.rowOrganismo_area = qx.util.Serializer.toNativeObject(cmbServicios.getModelSelection().getItem(0));
						
						params.organismo_area = context.rowOrganismo_area;
						var result = rpc.callSync("Ingresar", params);
						context._SYSusuario = txtUsuario.getValue();
						
						winLogin.close();
					}
				}
				catch (ex)
				{
					lblMSJ.setValue("<font color='red'>Se produjo un error en el Sistema!</font>");
					alert(ex);
				}
			}, this);

			if ((functionClose != "") && (functionClose != null) && (functionClose != undefined))
			{
				if (context)
					winLogin.addListener("close", functionClose, context);
				else
					winLogin.addListener("close", functionClose);
			}
			
			winLogin.open();
			if ((usuario != "") && (usuario != null) && (usuario != undefined))
			{
				txpPassword.focus();
			}
			else
			{
				txtUsuario.focus();
			}
		}
	}
});

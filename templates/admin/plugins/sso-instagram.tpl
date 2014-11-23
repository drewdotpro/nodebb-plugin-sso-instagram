<h1><i class="fa fa-instagram"></i> Instagram Accounts Social Authentication</h1>
<hr />

<form class="sso-instagram">
	<div class="alert alert-warning">
		<p>
			Create a <strong>Instagram Application</strong> via the
			<a href="http://instagram.com/developer/">Instagram Developer</a> and then paste
			your application details here.
		</p>
		<br />
		<input type="text" name="id" title="Client ID" class="form-control input-lg" placeholder="Client ID"><br />
		<input type="text" name="secret" title="Client Secret" class="form-control" placeholder="Client Secret">
		<p class="help-block">
			The appropriate "OAuth redirect_uri" is your NodeBB's URL with `/auth/instagram/callback` appended to it.
		</p>
	</div>
</form>

<button class="btn btn-lg btn-primary" type="button" id="save">Save</button>

<script>
	require(['settings'], function(Settings) {
		Settings.load('sso-instagram', $('.sso-instagram'));

		$('#save').on('click', function() {
			Settings.save('sso-instagram', $('.sso-instagram'));
		});
	});
</script>
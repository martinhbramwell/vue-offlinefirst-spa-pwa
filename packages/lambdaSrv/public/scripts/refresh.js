const refresh = async () => {
  const creds = await authenticate();
  CLG(`Authorized user ${creds.username}`);
  if (creds.password) window.location.reload(true);
}

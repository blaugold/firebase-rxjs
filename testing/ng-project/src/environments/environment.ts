// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase:   {
    "apiKey":            "AIzaSyBd0enZJAJQOdbOSBfoYQUh67Lgc3ta550",
    "authDomain":        "angular-firebase-tests-local.firebaseapp.com",
    "databaseURL":       "https://angular-firebase-tests-local.firebaseio.com",
    "storageBucket":     "angular-firebase-tests-local.appspot.com",
    "messagingSenderId": "452174369556"
  }
};

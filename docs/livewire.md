# Livewire

Livewire is installed and executed by Laravel; this npm package only compiles
frontend assets. The regular Livewire asset directives can be used alongside
Mix output:

```blade
@livewireStyles
<script src="{{ mix('js/app.js') }}" defer></script>
@livewireScripts
```

This applies to Livewire 2.8, 3.x, and 4.x when Livewire manages its own script
injection. Do not also include the same Livewire runtime in the compiled bundle.

## Manually bundling Livewire and Alpine

Manual bundling is a separate mode from compiling the application's own
JavaScript. Livewire versions expose different setup directives and runtime
entry points, so follow the matching Livewire version's installation guide.
For Livewire 3, its documentation explicitly says Laravel Mix is not compatible
with manually bundling Livewire and Alpine and recommends Vite. Livewire 4's
manual-bundling examples use Vite as well. The standard auto-injected mode above
does not require the application to switch its compiler.

This package does not include Laravel PHP code, so it cannot install Livewire,
register Laravel directives, or test Laravel/Livewire server behavior. Those
steps must be verified in the consuming Laravel application.

# RediOS Mobile Runtime

This Expo runtime renders mobile experiences from metadata.

Runtime flow:

1. `RuntimeScreen` receives an `entityCode`.
2. Mobile resolves `/api/experience/:entityCode?platform=MOBILE`.
3. The selected page, form, theme, and navigation metadata are loaded.
4. `@redios/runtime-renderer-core` creates the `RuntimeNode` tree.
5. `MobileRuntimeAdapter` maps generic runtime nodes to React Native components.

The app contains no entity-specific screens, workflows, forms, or APIs.

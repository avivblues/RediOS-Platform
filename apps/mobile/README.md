# RediOS Mobile Runtime

Mobile rendering will consume `@redios/runtime-renderer-core`.

The shared core owns:

- metadata traversal
- runtime tree generation
- form binding
- visibility and readonly decisions
- action resolution
- platform layout resolution

Future React Native work should provide a mobile `PlatformAdapter` that maps generic `RuntimeNode.component` values such as `TEXT_INPUT`, `BUTTON`, `LOOKUP`, `TABLE`, `CARD`, and `FORM_FIELD` to native components.

No mobile screens or entity-specific renderers are defined in this placeholder.

import { Converter, ReflectionKind } from 'typedoc'

/**
 * TypeDoc plugin: hide any documented members whose name starts with `_`.
 *
 * This is our convention for "internal" API surface that should not appear in generated docs.
 */
export function load(app) {
  app.converter.on(Converter.EVENT_RESOLVE_END, (context) => {
    const project = context.project
    const members = project.getReflectionsByKind(ReflectionKind.SomeMember)

    const toRemove = []
    for (const r of members) {
      if (typeof r?.name === 'string' && r.name.startsWith('_')) {
        toRemove.push(r)
      }
    }

    for (const r of toRemove) {
      project.removeReflection(r)
    }
  })
}



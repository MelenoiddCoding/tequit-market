# Búsqueda

`lib/search.ts` es una capa reemplazable. Normaliza Unicode, minúsculas, puntuación y espacios; puntúa coincidencias en nombre, profesión, categoría, servicio, alias, capacidades, bio, productos y zona. El seed PostgreSQL incluye `tsvector`, GIN y trigram.

Aliases cubiertos: plomero/fontanero, poner/pegar piso, lavadora descompuesta, clima/aire acondicionado, albañil/chalán y pintar casa. El plan no altera el score: Free conserva profesión/capacidades aunque sólo publique cinco servicios.

Para producción, la siguiente iteración es una RPC PostgreSQL que combine alias exacto, full-text y similitud trigram; la firma de salida debe conservar `SearchResult`.

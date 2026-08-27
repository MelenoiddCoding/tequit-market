insert into public.service_categories(name,slug,sort_order) values
('Construcción','construccion',10),('Plomería','plomeria',20),('Electricidad','electricidad',30),
('Electrodomésticos','electrodomesticos',40),('Climatización','climatizacion',50),('Hogar','hogar',60),('Eventos','eventos',70)
on conflict(slug) do update set name=excluded.name;

with rows(category_slug,name,slug,description) as (values
('construccion','Albañilería','albanileria','Trabajos generales de albañilería'),('construccion','Mampostería','mamposteria','Construcción con piezas y mortero'),
('construccion','Pegado de piso','pegado-de-piso','Instalación de pisos'),('construccion','Concreto estampado','concreto-estampado','Acabados decorativos de concreto'),
('construccion','Enjarre','enjarre','Enjarre de muros'),('construccion','Construcción de muros','construccion-de-muros','Muros residenciales'),
('construccion','Banquetas','banquetas','Construcción y reparación de banquetas'),('construccion','Impermeabilización','impermeabilizacion','Protección contra humedad'),
('construccion','Pintura','pintura','Pintura interior y exterior'),('construccion','Yeso y tablaroca','yeso-tablaroca','Muros y plafones ligeros'),
('plomeria','Fugas e instalaciones','plomeria','Fugas, tinacos, boilers, bombas y tuberías'),
('electricidad','Instalaciones eléctricas','electricidad','Contactos, iluminación y centros de carga'),
('electrodomesticos','Reparación de lavadoras','reparacion-de-lavadoras','Diagnóstico y reparación'),
('climatizacion','Minisplits','minisplits','Instalación, mantenimiento y reparación'),
('hogar','Limpieza','limpieza','Limpieza doméstica'),('hogar','Jardinería','jardineria','Mantenimiento de jardines'),
('hogar','Carpintería','carpinteria','Muebles y reparaciones'),('hogar','Soldadura','soldadura','Estructuras y reparaciones'),
('eventos','Decoración de bodas','decoracion-de-bodas','Diseño y montaje'),('eventos','Decoración de XV años','decoracion-xv-anos','Diseño y montaje'),
('eventos','Arreglos florales','arreglos-florales','Flores para ocasiones'),('eventos','Decoración de eventos','decoracion-de-eventos','Montajes personalizados')
)
insert into public.canonical_services(category_id,name,slug,description)
select c.id,r.name,r.slug,r.description from rows r join public.service_categories c on c.slug=r.category_slug
on conflict(slug) do update set name=excluded.name,description=excluded.description;

with rows(service_slug,alias) as (values
('plomeria','plomero'),('plomeria','fontanero'),('plomeria','fontanería'),('pegado-de-piso','pegar piso'),('pegado-de-piso','poner piso'),
('reparacion-de-lavadoras','lavadora descompuesta'),('minisplits','clima'),('minisplits','aire acondicionado'),('albanileria','albañil'),
('albanileria','chalán'),('pintura','pintar mi casa'),('decoracion-de-bodas','decorar boda')
)
insert into public.service_aliases(canonical_service_id,alias,normalized_alias)
select s.id,r.alias,lower(unaccent(r.alias)) from rows r join public.canonical_services s on s.slug=r.service_slug
on conflict(canonical_service_id,normalized_alias) do nothing;

insert into public.service_areas(name) values ('Centro'),('Ciudad del Valle'),('Ciudad Industrial'),('La Loma'),('Vistas de la Cantera'),('Xalisco') on conflict(name) do nothing;

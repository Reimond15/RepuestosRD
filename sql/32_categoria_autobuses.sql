update public.categorias
   set nombre = 'Autobuses'
 where slug = 'guaguas';

select slug, nombre from public.categorias order by slug;

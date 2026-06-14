'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { searchRepo, favoriteRepo, bibliographyRepo } from '@/lib/repository';
import { SearchResult } from '@/lib/types';
import { PageHeader, EvidenceBadge, SourceTypeBadge, ReliabilityBadge, EmptyState } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart, Search, Zap, BookPlus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function StudentSearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [evidenceFilter, setEvidenceFilter] = useState('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.id) {
      const favs = favoriteRepo.getByUser(user.id);
      setFavorites(new Set(favs.map(f => f.searchResultId)));
    }
  }, [user?.id]);

  const handleSearch = () => {
    const filters: Record<string, string | number> = {};
    if (typeFilter && typeFilter !== 'all') filters.type = typeFilter;
    if (yearFilter && yearFilter !== 'all') filters.year = parseInt(yearFilter);
    if (evidenceFilter && evidenceFilter !== 'all') filters.evidenceLevel = parseInt(evidenceFilter);

    const searchResults = searchRepo.search(query, filters);
    setResults(searchResults);

    if (searchResults.length === 0) {
      toast.info('No se encontraron resultados');
    }
  };

  const toggleFavorite = (resultId: string) => {
    if (!user?.id) return;
    if (favorites.has(resultId)) {
      favoriteRepo.remove(user.id, resultId);
      setFavorites(prev => { const n = new Set(prev); n.delete(resultId); return n; });
      toast.success('Removido de favoritos');
    } else {
      favoriteRepo.add(user.id, resultId);
      setFavorites(prev => new Set(prev).add(resultId));
      toast.success('Agregado a favoritos');
    }
  };

  const addToBibliography = (result: SearchResult) => {
    if (!user?.id) return;
    bibliographyRepo.create({
      type: result.type === 'book' ? 'book' : result.type === 'web' ? 'web' : 'article',
      author: result.authors,
      title: result.title,
      year: String(result.year),
      journal: result.journal,
      doi: result.doi,
      url: result.url,
      userId: user.id,
    });
    toast.success('Agregado a bibliografía');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Busqueda Academica" description="Busca fuentes confiables para tus casos clinicos" />

      <Card>
        <CardHeader><CardTitle>Busqueda y Filtros</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Busca por titulo, autores, palabras clave..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            <Button onClick={handleSearch} className="gap-2"><Search className="h-4 w-4" /> Buscar</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Fuente</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="article">Articulo</SelectItem>
                  <SelectItem value="book">Libro</SelectItem>
                  <SelectItem value="clinical_guide">Guia Clinica</SelectItem>
                  <SelectItem value="systematic_review">Revision Sistematica</SelectItem>
                  <SelectItem value="clinical_trial">Ensayo Clinico</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ano</label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger><SelectValue placeholder="Cualquier ano" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquier ano</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2020">2020</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nivel de Evidencia</label>
              <Select value={evidenceFilter} onValueChange={setEvidenceFilter}>
                <SelectTrigger><SelectValue placeholder="Todos los niveles" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niveles</SelectItem>
                  <SelectItem value="1">Nivel I</SelectItem>
                  <SelectItem value="2">Nivel II</SelectItem>
                  <SelectItem value="3">Nivel III</SelectItem>
                  <SelectItem value="4">Nivel IV</SelectItem>
                  <SelectItem value="5">Nivel V</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {results.length === 0 ? (
        <EmptyState icon={<Search className="h-12 w-12" />} title="Sin resultados" description={query ? "Intenta con terminos diferentes o sin filtros" : "Comienza buscando terminos academicos"} />
      ) : (
        <div className="space-y-3">
          {results.map((result) => (
            <Card key={result.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => setSelectedResult(result)}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{result.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{result.authors}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs text-muted-foreground">{result.year} - {result.journal || result.source}</span>
                      <SourceTypeBadge type={result.type} />
                      <EvidenceBadge level={result.evidenceLevel} />
                      <ReliabilityBadge reliability={result.reliability} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => toggleFavorite(result.id)}>
                      <Heart className={`h-4 w-4 ${favorites.has(result.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Link href="/student/verify">
                      <Button variant="ghost" size="sm"><Zap className="h-4 w-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => addToBibliography(result)}>
                      <BookPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
        <DialogContent className="max-w-2xl">
          {selectedResult && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedResult.title}</DialogTitle>
                <DialogDescription>{selectedResult.authors}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Abstract</h4>
                  <p className="text-sm text-muted-foreground">{selectedResult.abstract}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs font-medium text-muted-foreground">Ano</p><p className="text-sm">{selectedResult.year}</p></div>
                  <div><p className="text-xs font-medium text-muted-foreground">Fuente</p><p className="text-sm">{selectedResult.journal || selectedResult.source}</p></div>
                  <div><p className="text-xs font-medium text-muted-foreground">Tipo</p><SourceTypeBadge type={selectedResult.type} /></div>
                  <div><p className="text-xs font-medium text-muted-foreground">Nivel de Evidencia</p><EvidenceBadge level={selectedResult.evidenceLevel} /></div>
                  <div><p className="text-xs font-medium text-muted-foreground">Confiabilidad</p><ReliabilityBadge reliability={selectedResult.reliability} /></div>
                  {selectedResult.keywords && <div><p className="text-xs font-medium text-muted-foreground">Palabras Clave</p><p className="text-sm">{selectedResult.keywords.join(', ')}</p></div>}
                </div>
                {selectedResult.doi && <div><p className="text-xs font-medium text-muted-foreground">DOI</p><p className="text-sm break-all">{selectedResult.doi}</p></div>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedResult(null)}>Cerrar</Button>
                <Button onClick={() => { toggleFavorite(selectedResult.id); }}>
                  <Heart className={`h-4 w-4 mr-2 ${favorites.has(selectedResult.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  {favorites.has(selectedResult.id) ? 'Remover de' : 'Agregar a'} Favoritos
                </Button>
                <Button variant="outline" onClick={() => { addToBibliography(selectedResult); setSelectedResult(null); }}>
                  <BookPlus className="h-4 w-4 mr-2" /> Agregar a Bibliografia
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

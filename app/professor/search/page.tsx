'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { searchRepo, favoriteRepo } from '@/lib/repository';
import { SearchResult } from '@/lib/types';
import { PageHeader, EvidenceBadge, SourceTypeBadge, ReliabilityBadge, EmptyState } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Star, Send, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfessorSearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [reliabilityFilter, setReliabilityFilter] = useState('all');
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const favs = favoriteRepo.getByUser(user.id);
    setFavorites(new Set(favs.map(f => f.searchResultId)));
  }, [user]);

  const handleSearch = () => {
    if (!query.trim()) {
      toast.error('Escribe una búsqueda');
      return;
    }
    let filtered = searchRepo.search(query, {
      type: typeFilter !== 'all' ? typeFilter : undefined,
      evidenceLevel: undefined,
    });

    if (reliabilityFilter !== 'all') {
      filtered = filtered.filter(r => r.reliability === reliabilityFilter);
    }

    setResults(filtered);
    setSearched(true);
  };

  const handleToggleFavorite = (id: string) => {
    if (!user) return;
    if (favorites.has(id)) {
      favoriteRepo.remove(user.id, id);
      const newFavs = new Set(favorites);
      newFavs.delete(id);
      setFavorites(newFavs);
      toast.success('Eliminado de favoritos');
    } else {
      favoriteRepo.add(user.id, id);
      const newFavs = new Set(favorites);
      newFavs.add(id);
      setFavorites(newFavs);
      toast.success('Agregado a favoritos');
    }
  };

  const handleRecommend = (result: SearchResult) => {
    toast.success('Recomendación guardada para estudiantes');
  };

  const filtered = results.filter(r => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (reliabilityFilter !== 'all' && r.reliability !== reliabilityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Búsqueda de Fuentes"
        description="Busca y recomienda fuentes académicas a tus estudiantes"
      />

      <Card>
        <CardHeader>
          <CardTitle>Búsqueda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Busca por título, autores o palabras clave..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>Buscar</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Fuente</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="article">Artículo</SelectItem>
                  <SelectItem value="systematic_review">Revisión Sistemática</SelectItem>
                  <SelectItem value="clinical_trial">Ensayo Clínico</SelectItem>
                  <SelectItem value="clinical_guide">Guía Clínica</SelectItem>
                  <SelectItem value="book">Libro</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Confiabilidad</label>
              <Select value={reliabilityFilter} onValueChange={setReliabilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!searched ? (
        <EmptyState
          icon={<AlertTriangle className="h-8 w-8" />}
          title="Comienza tu búsqueda"
          description="Ingresa términos para encontrar fuentes académicas"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="h-8 w-8" />}
          title="Sin resultados"
          description="Intenta con otros términos de búsqueda"
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(result => (
            <Card key={result.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 cursor-pointer" onClick={() => setSelectedResult(result)}>
                      <h3 className="font-semibold hover:text-primary">{result.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{result.authors}</p>
                      <p className="text-sm text-muted-foreground">{result.journal || result.source} ({result.year})</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleFavorite(result.id)}
                      className={favorites.has(result.id) ? 'text-yellow-500' : ''}
                    >
                      <Star className="h-4 w-4" fill={favorites.has(result.id) ? 'currentColor' : 'none'} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <SourceTypeBadge type={result.type} />
                    <EvidenceBadge level={result.evidenceLevel} />
                    <ReliabilityBadge reliability={result.reliability} />
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{result.abstract}</p>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedResult(result)}>
                      Ver Detalles
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRecommend(result)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Recomendar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedResult?.title}</DialogTitle>
            <DialogDescription>{selectedResult?.authors}</DialogDescription>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <SourceTypeBadge type={selectedResult.type} />
                <EvidenceBadge level={selectedResult.evidenceLevel} />
                <ReliabilityBadge reliability={selectedResult.reliability} />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Abstract</h4>
                <p className="text-sm text-muted-foreground">{selectedResult.abstract}</p>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Año</p>
                  <p className="font-medium">{selectedResult.year}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Revista/Fuente</p>
                  <p className="font-medium">{selectedResult.journal || selectedResult.source}</p>
                </div>
                {selectedResult.doi && (
                  <div>
                    <p className="text-muted-foreground">DOI</p>
                    <p className="font-medium">{selectedResult.doi}</p>
                  </div>
                )}
                {selectedResult.url && (
                  <div>
                    <p className="text-muted-foreground">URL</p>
                    <a href={selectedResult.url} target="_blank" rel="noopener noreferrer" className="text-primary">
                      Ver fuente
                    </a>
                  </div>
                )}
              </div>
              {selectedResult.keywords.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Palabras clave</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedResult.keywords.map((kw, i) => (
                      <Badge key={i} variant="secondary">{kw}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

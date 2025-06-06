import React, { createContext, useState, useContext, useEffect } from 'react';
import { Game } from '../types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface GameContextType {
  games: Game[];
  loading: boolean;
  error: string | null;
  addGame: (game: Omit<Game, 'id' | 'dateAdded' | 'lastUpdated'>) => Promise<void>;
  updateGame: (id: string, game: Partial<Game>) => Promise<void>;
  deleteGame: (id: string) => Promise<void>;
  getGame: (id: string) => Game | undefined;
  refreshGames: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGames(data.map(game => ({
        ...game,
        dateAdded: new Date(game.created_at),
        lastUpdated: new Date(game.updated_at),
        images: game.image_url ? [game.image_url] : [],
        conditionNotes: game.condition_notes || '',
        // Sales fields
        askingPrice: game.asking_price,
        forSale: game.for_sale !== false, // Default to true
        saleConditionNotes: game.sale_condition_notes,
        missingParts: game.missing_parts || [],
        saleNotes: game.sale_notes
      })));
      setError(null);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const addGame = async (newGame: Omit<Game, 'id' | 'dateAdded' | 'lastUpdated'>) => {
    try {
      const { data, error } = await supabase
        .from('games')
        .insert([{
          name: newGame.name,
          type: newGame.type,
          type_other: newGame.otherType,
          location: newGame.location,
          location_other: newGame.otherLocation,
          status: newGame.status,
          condition_notes: newGame.conditionNotes,
          image_url: newGame.images[0] || null,
          // Sales fields - all games are for sale by default
          for_sale: true,
          asking_price: newGame.askingPrice,
          sale_condition_notes: newGame.saleConditionNotes,
          missing_parts: newGame.missingParts,
          sale_notes: newGame.saleNotes
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchGames();
      return data;
    } catch (error) {
      console.error('Error adding game:', error);
      throw error;
    }
  };

  const updateGame = async (id: string, updatedGame: Partial<Game>) => {
    try {
      const { error } = await supabase
        .from('games')
        .update({
          name: updatedGame.name,
          type: updatedGame.type,
          type_other: updatedGame.otherType,
          location: updatedGame.location,
          location_other: updatedGame.otherLocation,
          status: updatedGame.status,
          condition_notes: updatedGame.conditionNotes,
          image_url: updatedGame.images?.[0] || null,
          // Sales fields
          asking_price: updatedGame.askingPrice,
          for_sale: updatedGame.forSale,
          sale_condition_notes: updatedGame.saleConditionNotes,
          missing_parts: updatedGame.missingParts,
          sale_notes: updatedGame.saleNotes
        })
        .eq('id', id);

      if (error) throw error;

      await fetchGames();
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  };

  const deleteGame = async (id: string) => {
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchGames();
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  };

  const getGame = (id: string) => {
    return games.find((game) => game.id === id);
  };

  return (
    <GameContext.Provider
      value={{
        games,
        loading,
        error,
        addGame,
        updateGame,
        deleteGame,
        getGame,
        refreshGames: fetchGames
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
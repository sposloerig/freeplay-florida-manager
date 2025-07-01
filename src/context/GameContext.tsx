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
      // Auto-mark for sale if there's a price
      const autoForSale = newGame.askingPrice && newGame.askingPrice > 0;
      
      const { data, error } = await supabase
        .from('games')
        .insert([{
          name: newGame.name.trim(),
          type: newGame.type.trim(),
          type_other: newGame.otherType?.trim(),
          location: newGame.location.trim(),
          location_other: newGame.otherLocation?.trim(),
          status: newGame.status.trim(),
          condition_notes: newGame.conditionNotes?.trim(),
          image_url: newGame.images.length > 0 ? newGame.images[0] : null,
          // Sales fields - all games are for sale by default
          for_sale: autoForSale,
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
      // Auto-mark for sale if there's a price
      const autoForSale = updatedGame.askingPrice && updatedGame.askingPrice > 0;
      const finalForSale = autoForSale || updatedGame.forSale;
      
      const { error } = await supabase
        .from('games')
        .update({
          name: updatedGame.name?.trim(),
          type: updatedGame.type?.trim(),
          type_other: updatedGame.otherType?.trim(),
          location: updatedGame.location?.trim(),
          location_other: updatedGame.otherLocation?.trim(),
          status: updatedGame.status?.trim(),
          condition_notes: updatedGame.conditionNotes?.trim(),
          image_url: updatedGame.images?.length > 0 ? updatedGame.images[0] : null,
          // Sales fields
          asking_price: updatedGame.askingPrice,
          for_sale: finalForSale,
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
      console.log('Attempting to delete game with ID:', id);
      
      // First, delete any associated repairs (they should cascade, but let's be explicit)
      const { error: repairsError } = await supabase
        .from('repairs')
        .delete()
        .eq('game_id', id);

      if (repairsError) {
        console.warn('Error deleting repairs (may not exist):', repairsError);
        // Don't throw here as repairs might not exist
      }

      // Delete any buyer inquiries
      const { error: inquiriesError } = await supabase
        .from('buyer_inquiries')
        .delete()
        .eq('game_id', id);

      if (inquiriesError) {
        console.warn('Error deleting buyer inquiries (may not exist):', inquiriesError);
        // Don't throw here as inquiries might not exist
      }

      // Now delete the game
      const { error: gameError } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (gameError) {
        console.error('Error deleting game:', gameError);
        throw gameError;
      }

      console.log('Game deleted successfully');
      
      // Refresh the games list
      await fetchGames();
    } catch (error) {
      console.error('Error in deleteGame function:', error);
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
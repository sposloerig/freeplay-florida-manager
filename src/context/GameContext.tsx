import React, { createContext, useState, useContext, useEffect } from 'react';
import { Game } from '../types';
import { supabase } from '../lib/supabase';

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
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      setGames(data.map(game => ({
        ...game,
        shortId: game.short_id,
        dateAdded: new Date(game.created_at),
        lastUpdated: new Date(game.updated_at),
        zone: game.zone,
        // Handle multiple images from images array
        images: game.images || [],
        conditionNotes: game.condition_notes || '',
        // Sales fields
        askingPrice: game.asking_price ? Number(game.asking_price) : undefined,
        forSale: game.for_sale !== false, // Default to true
        saleConditionNotes: game.sale_condition_notes,
        missingParts: game.missing_parts || [],
        saleNotes: game.sale_notes,
        // Approval fields
        approvalStatus: game.approval_status || 'pending',
        submittedAt: game.submitted_at ? new Date(game.submitted_at) : game.dateAdded,
        approvedAt: game.approved_at ? new Date(game.approved_at) : null,
        approvedBy: game.approved_by,
        rejectionReason: game.rejection_reason,
        // Owner fields
        ownerName: game.owner_name || '',
        ownerEmail: game.owner_email || '',
        ownerPhone: game.owner_phone,
        ownerAddress: game.owner_address,
        ownerNotes: game.owner_notes,
        displayContactPublicly: game.display_contact_publicly || false,
        // Service fields
        allowOthersToService: game.allow_others_to_service || false,
        serviceNotes: game.service_notes,
        acceptOffers: game.accept_offers || false,
        // Check-in fields
        checkedIn: game.checked_in || false,
        checkedInAt: game.checked_in_at ? new Date(game.checked_in_at) : undefined,
        checkedInBy: game.checked_in_by,
        hasKey: game.has_key || false,
        workingCondition: game.working_condition || false,
        checkInNotes: game.check_in_notes
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
          name: newGame.name?.trim() || '',
          type: newGame.type?.trim() || 'Arcade',
          type_other: newGame.otherType?.trim() || null,
          status: newGame.status?.trim() || 'Operational',
          condition_notes: newGame.conditionNotes?.trim() || null,
          // Store all images in images column (text array)
          images: newGame.images && newGame.images.length > 0 ? newGame.images : null,
          // Sales fields - all games are for sale by default
          for_sale: autoForSale,
          asking_price: newGame.askingPrice,
          sale_condition_notes: newGame.saleConditionNotes,
          missing_parts: newGame.missingParts,
          sale_notes: newGame.saleNotes,
          // Owner information
          owner_name: newGame.ownerName?.trim() || 'Admin Added',
          owner_email: newGame.ownerEmail?.trim() || 'admin@freeplayflorida.com',
          owner_phone: newGame.ownerPhone?.trim() || null,
          owner_address: newGame.ownerAddress?.trim() || null,
          owner_notes: newGame.ownerNotes?.trim() || null,
          display_contact_publicly: newGame.displayContactPublicly || false,
          // Service preferences
          allow_others_to_service: newGame.allowOthersToService || true,
          service_notes: newGame.serviceNotes?.trim() || null,
          // Approval workflow (admin-added games are auto-approved)
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: 'admin@test.com',
          // Check-in fields (defaults)
          checked_in: false,
          has_key: false,
          working_condition: false
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
          name: updatedGame.name?.trim() || '',
          type: updatedGame.type?.trim() || 'Arcade',
          type_other: updatedGame.otherType?.trim() || null,
          status: updatedGame.status?.trim() || 'Operational',
          zone: updatedGame.zone?.trim() || null,
          condition_notes: updatedGame.conditionNotes?.trim() || null,
          // Store all images in images column (text array)
          images: updatedGame.images && updatedGame.images.length > 0 ? updatedGame.images : null,
          // Sales fields
          asking_price: updatedGame.askingPrice,
          for_sale: finalForSale,
          sale_condition_notes: updatedGame.saleConditionNotes,
          missing_parts: updatedGame.missingParts,
          sale_notes: updatedGame.saleNotes,
          // Owner fields
          owner_name: updatedGame.ownerName?.trim() || null,
          owner_email: updatedGame.ownerEmail?.trim() || null,
          owner_phone: updatedGame.ownerPhone?.trim() || null,
          owner_notes: updatedGame.ownerNotes?.trim() || null,
          display_contact_publicly: updatedGame.displayContactPublicly || false,
          // Check-in fields
          checked_in: updatedGame.checkedIn || false,
          checked_in_at: updatedGame.checkedInAt ? updatedGame.checkedInAt.toISOString() : null,
          checked_in_by: updatedGame.checkedInBy?.trim() || null,
          has_key: updatedGame.hasKey || false,
          working_condition: updatedGame.workingCondition || false,
          check_in_notes: updatedGame.checkInNotes?.trim() || null
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
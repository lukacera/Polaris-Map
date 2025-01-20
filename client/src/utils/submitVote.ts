// src/services/voteService.ts

type VoteType = 'higher' | 'lower' | 'equal';

interface VoteResponse {
  success: boolean;
  message: string;
}

export const submitVote = async (
  propertyId: string,
  voteType: VoteType
): Promise<VoteResponse> => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/vote/${propertyId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ voteType }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit vote');
    }

    return {
      success: true,
      message: 'Vote submitted successfully'
    };
  } catch (error) {
    console.error('Error submitting vote:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit vote'
    };
  }
};
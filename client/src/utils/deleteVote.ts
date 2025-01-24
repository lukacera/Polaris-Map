interface VoteResponse {
  success: boolean;
  message: string;
}

export const deleteVote = async (
  propertyId: string,
): Promise<VoteResponse> => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/vote/${propertyId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete vote');
    }

    return {
      success: true,
      message: 'Vote submitted successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit vote';
    return {
      success: false,
      message: errorMessage,
    };
  }
};
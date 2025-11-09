const API_URL = "http://localhost:4000/api";

export const fetchProperties = async () => {
    const response = await fetch(`${API_URL}/properties`);

    if (!response.ok) {
        throw new Error('Failed to fetch properties');
    }

    return response.json();
}

export const fetchPropertyById = async (id: string | number) => {
    const response = await fetch(`${API_URL}/properties/${id}`);

    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error('Failed to fetch property');
    }

    return response.json();
}
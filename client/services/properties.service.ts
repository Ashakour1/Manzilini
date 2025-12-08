const API_URL = "https://manzilline-production-fcab.up.railway.app/api/v1";

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

export const fetchPropertyTypes = async () => {
    const response = await fetch(`${API_URL}/properties/types`);

    if (!response.ok) {
        throw new Error('Failed to fetch property types');
    }

    return response.json();
}

const API_URL = "http://localhost:4000/api/v1";

export const    fetchProperties = async (  city: string , property_type: string, ) => {

    const cityQuery = city ? `?city=${city}` : '' ;

    const propertyTypeQuery = property_type ? `&property_type=${property_type}` : '';

    const response = await fetch(`${API_URL}/properties${cityQuery}${propertyTypeQuery}`);

    

    if (!response.ok) {
        throw new Error('Failed to fetch properties' + response.statusText);
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

export const fetchPropertyCountsByCity = async () => {
    const response = await fetch(`${API_URL}/properties/cities/counts`);

    if (!response.ok) {
        throw new Error('Failed to fetch property counts by city');
    }

    return response.json();
}

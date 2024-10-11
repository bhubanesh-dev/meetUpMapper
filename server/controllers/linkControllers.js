// linkController.js
let links = {}; // Simulate a database for storing links

export const generateLink = (req, res) => {
    try {
      // Logic to generate the link
      const generateRandomString = (length) => {
        return Math.random().toString(36).substring(2, 2 + length); // Generate a random string of specified length
      };
  
      // Create the formatted link
      const newLink = `https://connect2friend.com/${generateRandomString(3)}-${generateRandomString(3)}-${generateRandomString(3)}`;
  
      res.status(200).json({ link: newLink });
    } catch (error) {
      console.error('Error generating link:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

// Submit a link
export const submitLink = (req, res) => {
    const { linkId, userId } = req.body;
    if (links[linkId]) {
        res.json({ message: "Link submitted successfully", link: links[linkId] });
    } else {
        res.status(404).json({ message: "Link not found" });
    }
};
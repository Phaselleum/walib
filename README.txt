This project is currently WIP.

=============================================

Exported methods required by plugins:

getURLParts():
- returns an array containing all first subdirectories of incoming URLs handled by the plugin

publicSubFolders():
- returns folders the plugin requires access to within the public/ folder.

handleURL(url, admin, res, req, nameList, database):
# handles URL access
+ url: array of the full url split by directories, as in String.split("/");
+ admin: boolean if the user has admin access
+ req: the request as given to the server function by the http.Server object
+ res: the response as given to the server function by the http.Server object
+ nameList: list of names blocked by the system or plugins
+ database: the main database object

loadDatabase(database):
# sets up the database on server start, loading external files into the resources and library items of the database.
+ database: the main database object

=============================================

This project requires ImageMagick to convert uploaded pdfs vor viewing in the BookReader tool.

Used plugins/libraries:
node.js by Ryan Dahl
formidable (node module) by felixge
pdf-image (node module) by mooz
Internet Archive BookReader (JavaScript library)
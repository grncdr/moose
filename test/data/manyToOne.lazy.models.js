var moose = require("../../lib"),
        mysql = moose.adapters.mysql,
        types = mysql.types;

exports.loadModels = function() {
    var ret = new moose.Promise();
    var options = {
        connection : {user : "test", password : "testpass", database : 'test'},
        dir : "./data/migrations/manyToOne",
        start : 0,
        up : false
    };

    moose.migrate(options).then(function() {
        moose.migrate(moose.merge(options, {up : true}))
                .chain(hitch(moose, "loadSchemas", ["company", "employee"]))
                .then(function(company, employee) {
            var Company = moose.addModel(company);
            var Employee = moose.addModel(employee);
            //define associations

            Employee.manyToOne("company", {model : Company.tableName, fetchType : Employee.fetchType.EAGER, key : {companyId : "id"}});
            Company.oneToMany("employees", {model : Employee.tableName, orderBy : {id : "desc"}, key : {id : "companyId"}});
            ret.callback();
        }, hitch(console, "log"));
    });
    return ret;
}
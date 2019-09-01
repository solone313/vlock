

var Web3;
var abi;
var VotingContract;
var contractInstance;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const port = 3000;
var mongoose = require('mongoose');
var num_of_candidate = 0;
var md5 = require('md5');
var salt = '$%#@7@zvvcweer';
var session = require('express-session')
app.use(session({
    secret: 'asd@fij80-124', // 암호화
    resave: false,
    saveUninitialized: true
}));
var path = require('path');
app.use(express.static(path.join(__dirname,'views')))

var ejs = require('ejs');
app.set('view engine','ejs');
app.set('views','./views');
app.use(bodyParser.urlencoded({extended:false}));

var UserSchema;
var CandidateSchema;
var UserModel;
var CandidateModel;
var ch = ['0xcd45a877b2b29648a8eb76d03bcc28dce30fa87e','0x4d645175706c6edd6097f3b7eefba293e363161a'];
var cnt = 0;
function web3_connect(){
    Web3 = require('web3')
    web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
    abi = JSON.parse(`[
		{
			"constant": false,
			"inputs": [
				{
					"name": "_id",
					"type": "string"
				},
				{
					"name": "_name",
					"type": "string"
				},
				{
					"name": "_party",
					"type": "string"
				}
			],
			"name": "addCandidator",
			"outputs": [
				{
					"name": "",
					"type": "bool"
				}
			],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"constant": false,
			"inputs": [
				{
					"name": "a",
					"type": "string"
				},
				{
					"name": "b",
					"type": "string"
				}
			],
			"name": "compareString",
			"outputs": [
				{
					"name": "",
					"type": "bool"
				}
			],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"constant": false,
			"inputs": [
				{
					"name": "_id",
					"type": "string"
				}
			],
			"name": "finish_Vote",
			"outputs": [
				{
					"name": "",
					"type": "bool"
				}
			],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"constant": false,
			"inputs": [
				{
					"name": "_idx",
					"type": "uint256"
				}
			],
			"name": "get_votenum",
			"outputs": [
				{
					"name": "",
					"type": "uint256"
				}
			],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"constant": false,
			"inputs": [
				{
					"name": "_id",
					"type": "string"
				}
			],
			"name": "signUp",
			"outputs": [
				{
					"name": "",
					"type": "bool"
				}
			],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"constant": false,
			"inputs": [
				{
					"name": "_id",
					"type": "string"
				}
			],
			"name": "startvote",
			"outputs": [
				{
					"name": "",
					"type": "bool"
				}
			],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"constant": false,
			"inputs": [
				{
					"name": "_id",
					"type": "string"
				},
				{
					"name": "_idxnumber",
					"type": "uint256"
				}
			],
			"name": "upVote",
			"outputs": [
				{
					"name": "",
					"type": "bool"
				}
			],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "name",
					"type": "string"
				},
				{
					"indexed": false,
					"name": "party",
					"type": "string"
				}
			],
			"name": "AddCandidate",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "name",
					"type": "string"
				},
				{
					"indexed": false,
					"name": "voteNumber",
					"type": "uint256"
				}
			],
			"name": "UpVote",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "Alive",
					"type": "bool"
				}
			],
			"name": "FinishVote",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "owner",
					"type": "address"
				}
			],
			"name": "voteStart",
			"type": "event"
		},
		{
			"constant": true,
			"inputs": [
				{
					"name": "",
					"type": "uint256"
				}
			],
			"name": "candidateList",
			"outputs": [
				{
					"name": "upVote",
					"type": "uint256"
				},
				{
					"name": "party",
					"type": "string"
				},
				{
					"name": "name",
					"type": "string"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		}
	]`);
    VotingContract = web3.eth.contract(abi);
    contractInstance = VotingContract.at('0xb85026262df6cd95055c48b9f4b0d5fd2c58188b'); // deploy 할때 바꿀것
	
}

var candidate_array = [];
var isalive=null;
function ID_Hashing(_id){
    if(_id != 'admin')
        var id =  md5(_id+salt);
    else var id = 'admin';
    return id;
}

function connectDB(){
    var dbUrl = "mongodb://localhost:27017/DB"

    mongoose.connect(dbUrl);
    db = mongoose.connection;

    db.on('error',console.error.bind(console,'mongoose connection err'));
    db.on('open',() =>{
        CandidateSchema = mongoose.Schema({
            idx: Number,
            name: String,
            party: String,
            vote_num: Number
        });
        UserSchema = mongoose.Schema({
            id: String,
            password: String,
            name: String,
            phone: String
        });
        CandidateModel = mongoose.model("candidates",CandidateSchema);
        UserModel = mongoose.model("users", UserSchema);
		console.log('mongoose connection open! : '+dbUrl);
		CandidateModel.find({},(err,result)=>{
			num_of_candidate = result.length;
			for(var i=0;i<result.length;i++){
				candidate_array.push({idx:result[i].idx,name:result[i].name, party:result[i].party,vote_num:0});
				num_of_candidate += 1;
			}
		})
    });
    db.on('disconnected',connectDB);
}
app.get('/',(req,res) =>
{
    res.render('index');
});
app.use(express.static('public'));
app.get('/signUp',(req,res) =>{
    res.render('member/join');
})
app.post('/signUp',(req,res)=>{
    var id = ID_Hashing(req.body.id);
    var pw = md5(req.body.pw+salt);
    var name = req.body.name;
    var phone = req.body.phone;
    UserModel.find({id: id}, (err, result)=>{
        if(result.length == 0)
        {
            var newUser = new UserModel({id: id,password: pw,name: name, phone: phone});
            newUser.save(err =>{

			})
			var new_check = contractInstance.signUp.call(id).toString();
			contractInstance.signUp(id,{from:web3.eth.accounts[0],gas:4700000},()=>{});
			if(new_check == 'true')
				console.log(req.body.id+' '+name+' signup success.');
            res.redirect('login');
            
        }
        else
            res.send("이미 가입된 회원입니다.");
    })
})

app.get('/login',(req,res) => {
    if(req.session.identifier == 'admin')
        res.redirect('/admin');
    else {
        UserModel.find({id: req.session.identifier}, (err, result) => {
            if (result == 0)
                res.render('member/login');
            else res.redirect('/vote');

        });
    }
})
app.post('/login',(req,res) =>{
	req.session.identifier = 0;
	var id = ID_Hashing(req.body.id);
    var pw = md5(req.body.pw+salt);
    UserModel.find({id: id}, (err, result)=>{
        if(result.length == 1 && result[0].password == pw)
        {
            req.session.identifier = id;
            res.redirect('/login');
        }
        else{
            res.send('login_fail');
        }
    })
})
app.get('/logout',(req,res) =>{
	req.session.identifier = null;
	res.redirect("/");
})
app.get('/admin',(req,res) => {
	var id = ID_Hashing(req.session.identifier);
	if(id!="admin")
		res.redirect("/");
	else
		res.render('admin/admin')
})
app.post('/admin',(req,res)=>{
	var check;
	var id = ID_Hashing(req.session.identifier);
    //세션에서 받는 값에 따라, 투표 시작/종료 혹은 후보자등록 구분
    if(req.body.name != null){
        var name = req.body.name;
        var party = req.body.party;
        var newCandidate = new CandidateModel({idx: num_of_candidate, name: name, party: party, vote_num: 0});
		CandidateModel.find({name:name, party:party},(err,result)=>{
			if(result.length == 0){
				newCandidate.save(err => {

				})
				var check = contractInstance.addCandidator.call(id,name,party).toString();
				contractInstance.addCandidator(id,name,party,{from:web3.eth.accounts[0],gas:4700000},()=>{});
				if(check == 'true')
				{
					candidate_array.push({idx:num_of_candidate,name:name, party:party,vote_num:0});
					num_of_candidate += 1;
					console.log(name+ ' ' + party + ' add');
				}
			}
		})
    }
    if(req.body.value == 0)
    {
		check = contractInstance.startvote.call(id).toString();
		contractInstance.startvote(id,{from:web3.eth.accounts[0],gas:4700000},()=>{});
		if(check == 'true')
		{
			isalive = true;
			console.log('voting start!');
		}
    }
    else if(req.body.value == 1)
    {
		contractInstance.finish_Vote(id,{from:web3.eth.accounts[0],gas:4700000},()=>{});
		check = contractInstance.finish_Vote.call(id).toString();
		if(check == 'true')
		{
			cnt++;
			console.log('voting end!');
			isalive = false;
		}
    }

	res.redirect('/admin');
})
app.get('/vote',(req,res) => {
	if(isalive == false || req.session.identifier == null)
		res.redirect('/');
	else{
		res.render('vote/vote',{object_arr : candidate_array});
	}
})
app.post('/vote',(req,res)=>{
    var id = ID_Hashing(req.session.identifier);
    var idx = parseInt(req.body.idx);
	var check = false;
	check = contractInstance.upVote.call(id,idx).toString();
	contractInstance.upVote(id,idx,{from:web3.eth.accounts[0],gas:4700000},() => {});
    if(check == 'true')
		console.log('vote commit success.')
	res.redirect('/');
})
app.get('/result',(req,res) =>
{
	if(isalive == false)
	{
		for(var i=0;i<candidate_array.length;i++){
			var a = contractInstance.get_votenum.call(i).toString();
			a = Number(a);
			candidate_array[i]["vote_num"] = a;
		}
		keyObject = "vote_num";
		candidate_array.sort(function(a,b){
			return b[keyObject]-a[keyObject];
		})
		res.render('result/result',{candidate : candidate_array});
	}
	else res.redirect('/');
})
app.listen(port,() =>
{
	isalive = null
    console.log(`Connected ${port} port!`);
    web3_connect();
    if(web3.eth.accounts) {
        console.log('Ethreum connected.');
        console.log(web3.eth.accounts);
    }
    connectDB();
    console.log('DB connected.');
});